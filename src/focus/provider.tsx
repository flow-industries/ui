import {
  type ActionCatalogEntry,
  type CreateStudySubjectInput,
  elapsedSeconds,
  type FocusApi,
  type FocusSessionState,
  focusSessionReducer,
  INITIAL_FOCUS_STATE,
  isActiveSessionConflict,
  type StudyCatalog,
  type StudySubject,
} from "@flow-industries/id/focus";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

export interface StartFocusOptions {
  source: string;
  subjectId?: string;
  replace?: boolean;
}

export type StartFocusOutcome = "started" | "conflict" | "failed";

export interface StudyData {
  catalog: StudyCatalog | null;
  subjects: StudySubject[] | null;
  failed: boolean;
}

export interface FocusContextValue {
  /** Signed in with a usable account; everything else is inert otherwise. */
  enabled: boolean;
  viewerId: string | null;
  /** The client the provider talks through, shared with the host management page so it
   * never builds a second one; null outside a provider. */
  api: FocusApi | null;
  state: FocusSessionState;
  catalog: ActionCatalogEntry[] | null;
  catalogFailed: boolean;
  study: StudyData;
  /** The start a 409 interrupted, kept so "Switch" can repeat it with `replace`. */
  pendingStart: StartFocusOptions | null;
  refresh: () => void;
  loadStudy: () => void;
  start: (options: StartFocusOptions) => Promise<StartFocusOutcome>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  createSubject: (
    request: CreateStudySubjectInput,
  ) => Promise<StudySubject | null>;
  dismissFinished: () => void;
  dismissConflict: () => void;
}

const EMPTY_STUDY: StudyData = { catalog: null, subjects: null, failed: false };

const EMPTY: FocusContextValue = {
  enabled: false,
  viewerId: null,
  api: null,
  state: INITIAL_FOCUS_STATE,
  catalog: null,
  catalogFailed: false,
  study: EMPTY_STUDY,
  pendingStart: null,
  refresh: () => {},
  loadStudy: () => {},
  start: async () => "failed",
  pause: async () => {},
  resume: async () => {},
  stop: async () => {},
  createSubject: async () => null,
  dismissFinished: () => {},
  dismissConflict: () => {},
};

const FocusContext = createContext<FocusContextValue>(EMPTY);

export interface FocusProviderProps {
  api: FocusApi;
  viewerId: string | null;
  children: ReactNode;
}

export function FocusProvider({
  api,
  viewerId,
  children,
}: FocusProviderProps): ReactNode {
  return (
    <FocusSessionProvider
      key={viewerId ?? "signed-out"}
      api={api}
      viewerId={viewerId}
    >
      {children}
    </FocusSessionProvider>
  );
}

function FocusSessionProvider({
  api,
  viewerId,
  children,
}: FocusProviderProps): ReactNode {
  const enabled = viewerId !== null;
  const [state, dispatch] = useReducer(
    focusSessionReducer,
    INITIAL_FOCUS_STATE,
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const [catalog, setCatalog] = useState<ActionCatalogEntry[] | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [study, setStudy] = useState<StudyData>(EMPTY_STUDY);
  const [pendingStart, setPendingStart] = useState<StartFocusOptions | null>(
    null,
  );
  const generationRef = useRef(0);
  const studyRequestedRef = useRef(false);
  const mountedRef = useRef(false);
  const requestRef = useRef(false);
  const creatingRef = useRef(false);
  const readRef = useRef(0);

  const read = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    const generation = generationRef.current;
    const request = ++readRef.current;
    void api
      .active()
      .then((active) => {
        if (generationRef.current !== generation || request !== readRef.current)
          return;
        dispatch({ type: "read", active, at: Date.now() });
      })
      .catch(() => {
        if (generationRef.current !== generation || request !== readRef.current)
          return;
        dispatch({ type: "read-failed" });
      });
  }, [api, enabled]);

  const loadCatalog = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    const generation = generationRef.current;
    void api
      .catalog()
      .then((result) => {
        if (generationRef.current !== generation) return;
        setCatalog(result.actions);
        setCatalogFailed(false);
      })
      .catch(() => {
        if (generationRef.current !== generation) return;
        setCatalogFailed(true);
      });
  }, [api, enabled]);

  const loadSubjects = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    const generation = generationRef.current;
    void api
      .subjects()
      .then((result) => {
        if (generationRef.current !== generation) return;
        setStudy((current) => ({
          ...current,
          subjects: result.subjects,
        }));
      })
      .catch(() => {
        if (generationRef.current !== generation) return;
        setStudy((current) => ({ ...current, failed: true }));
      });
  }, [api, enabled]);

  const markSubjectUsed = useCallback((subjectId: string, at: string) => {
    setStudy((current) => ({
      ...current,
      subjects:
        current.subjects?.map((subject) =>
          subject.id === subjectId ? { ...subject, lastUsedAt: at } : subject,
        ) ?? null,
    }));
  }, []);

  const loadStudy = useCallback(() => {
    if (!enabled || !mountedRef.current) return;
    studyRequestedRef.current = true;
    const generation = generationRef.current;
    void Promise.allSettled([api.studyCatalog(), api.subjects()]).then(
      ([catalog, subjects]) => {
        if (generationRef.current !== generation) return;
        setStudy((current) => ({
          catalog:
            catalog.status === "fulfilled" ? catalog.value : current.catalog,
          subjects:
            subjects.status === "fulfilled"
              ? subjects.value.subjects
              : current.subjects,
          failed:
            catalog.status === "rejected" || subjects.status === "rejected",
        }));
      },
    );
  }, [api, enabled]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    requestRef.current = false;
    creatingRef.current = false;
    generationRef.current += 1;
    dispatch({ type: "reset" });
    setCatalog(null);
    setCatalogFailed(false);
    setStudy(EMPTY_STUDY);
    setPendingStart(null);
    studyRequestedRef.current = false;
    if (viewerId !== null) {
      read();
      loadCatalog();
    }
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, [viewerId, read, loadCatalog]);

  useEffect(() => {
    if (!enabled || !mountedRef.current) return;
    const generation = generationRef.current;
    const onVisibility = () => {
      const active = stateRef.current.active;
      if (document.visibilityState === "hidden") {
        if (active) {
          void api
            .event({ sessionId: active.sessionId, kind: "focus_lost" })
            .catch(() => {});
        }
        return;
      }
      if (!active) {
        read();
        return;
      }
      void api
        .event({ sessionId: active.sessionId, kind: "focus_gained" })
        .catch(() => {})
        .finally(() => {
          if (generationRef.current === generation) read();
        });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, api, read]);

  const start = useCallback(
    async (options: StartFocusOptions): Promise<StartFocusOutcome> => {
      if (!enabled || !mountedRef.current || requestRef.current)
        return "failed";
      const generation = generationRef.current;
      requestRef.current = true;
      readRef.current += 1;
      dispatch({ type: "request" });
      try {
        const result = await api.start(options);
        if (generationRef.current !== generation) return "failed";
        if (isActiveSessionConflict(result)) {
          setPendingStart(options);
          dispatch({ type: "conflict", active: result.active });
          return "conflict";
        }
        setPendingStart(null);
        dispatch({ type: "started", session: result.session, at: Date.now() });
        read();
        if (options.subjectId) {
          markSubjectUsed(options.subjectId, result.session.startedAt);
          if (studyRequestedRef.current) loadSubjects();
        }
        return "started";
      } catch {
        if (generationRef.current === generation) {
          dispatch({ type: "request-failed" });
        }
        return "failed";
      } finally {
        if (generationRef.current === generation) requestRef.current = false;
      }
    },
    [api, enabled, read, loadSubjects, markSubjectUsed],
  );

  const transition = useCallback(
    async (kind: "pause" | "resume") => {
      const active = stateRef.current.active;
      if (!enabled || !mountedRef.current || !active || requestRef.current)
        return;
      const generation = generationRef.current;
      requestRef.current = true;
      readRef.current += 1;
      dispatch({ type: "request" });
      try {
        await api.event({ sessionId: active.sessionId, kind });
        if (generationRef.current !== generation) return;
        dispatch({
          type: kind === "pause" ? "paused" : "resumed",
          at: Date.now(),
        });
      } catch {
        if (generationRef.current === generation) {
          dispatch({ type: "request-failed" });
        }
      } finally {
        if (generationRef.current === generation) requestRef.current = false;
      }
    },
    [api, enabled],
  );

  const pause = useCallback(() => transition("pause"), [transition]);
  const resume = useCallback(() => transition("resume"), [transition]);

  const stop = useCallback(async () => {
    const active = stateRef.current.active;
    if (!enabled || !mountedRef.current || !active || requestRef.current)
      return;
    const generation = generationRef.current;
    requestRef.current = true;
    readRef.current += 1;
    dispatch({ type: "request" });
    try {
      const result = await api.finish({ sessionId: active.sessionId });
      if (generationRef.current !== generation) return;
      dispatch({ type: "finished", result, at: Date.now() });
      read();
    } catch {
      if (generationRef.current === generation) {
        dispatch({ type: "request-failed" });
      }
    } finally {
      if (generationRef.current === generation) requestRef.current = false;
    }
  }, [api, enabled, read]);

  const createSubject = useCallback(
    async (request: CreateStudySubjectInput) => {
      if (!enabled || !mountedRef.current || creatingRef.current) return null;
      creatingRef.current = true;
      const generation = generationRef.current;
      try {
        const { subject } = await api.createSubject(request);
        if (generationRef.current !== generation) return null;
        setStudy((current) => ({
          ...current,
          subjects: current.subjects
            ? [
                ...current.subjects.filter((row) => row.id !== subject.id),
                subject,
              ]
            : [subject],
        }));
        return subject;
      } catch {
        return null;
      } finally {
        if (generationRef.current === generation) creatingRef.current = false;
      }
    },
    [api, enabled],
  );

  const dismissFinished = useCallback(
    () => dispatch({ type: "dismiss-finished" }),
    [],
  );
  const dismissConflict = useCallback(() => {
    setPendingStart(null);
    dispatch({ type: "dismiss-conflict" });
  }, []);

  const value = useMemo<FocusContextValue>(
    () => ({
      enabled,
      viewerId,
      api: enabled ? api : null,
      state,
      catalog,
      catalogFailed,
      study,
      pendingStart,
      refresh: read,
      loadStudy,
      start,
      pause,
      resume,
      stop,
      createSubject,
      dismissFinished,
      dismissConflict,
    }),
    [
      enabled,
      viewerId,
      api,
      state,
      catalog,
      catalogFailed,
      study,
      pendingStart,
      read,
      loadStudy,
      start,
      pause,
      resume,
      stop,
      createSubject,
      dismissFinished,
      dismissConflict,
    ],
  );

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
}

/** Outside a provider — the embed, or an SSR pass — this answers an inert,
 * signed-out value instead of throwing: a missing Focus must never take a
 * chat surface down with it. */
export function useFocus(): FocusContextValue {
  return useContext(FocusContext);
}

/** The running action, or null. */
export function useActiveAction(): FocusSessionState["active"] {
  const { state } = useFocus();
  return state.active;
}

const CLOCK_TICK_MS = 250;

/** Whole seconds elapsed on the running action, advancing on the local clock
 * from the last server sample and frozen while paused. Re-renders only when
 * the displayed second changes. */
export function useFocusElapsed(providedState?: FocusSessionState): number {
  const context = useFocus();
  const state = providedState ?? context.state;
  const anchor = state.anchor;
  const [shown, setShown] = useState(() =>
    anchor ? Math.floor(elapsedSeconds(anchor, Date.now())) : 0,
  );

  useEffect(() => {
    if (!anchor) {
      setShown(0);
      return;
    }
    const tick = () => {
      const whole = Math.floor(elapsedSeconds(anchor, Date.now()));
      setShown((current) => (current === whole ? current : whole));
    };
    tick();
    if (anchor.paused) return;
    const id = window.setInterval(tick, CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, [anchor]);

  return shown;
}
