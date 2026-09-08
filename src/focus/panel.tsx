import {
  type ActionCatalogEntry,
  type ActiveAction,
  actionHeadline,
  estimateActionXp,
  flowMultiplier,
  formatElapsed,
  STUDY_SOURCE,
} from "@flow-industries/id/focus";
import { ChevronLeft, Pause, Play, Repeat, Square } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "../components/ui/button";
import { cn } from "../utils/cn";
import {
  type FocusContextValue,
  type StartFocusOptions,
  useFocusElapsed,
} from "./provider";
import { StudySubjectPicker } from "./study-subject-picker";
import { type FocusText, FocusTextProvider, useFocusText } from "./text";

type Picking = { step: "actions" | "study"; replace: boolean };

export function catalogEntryFor(
  catalog: ActionCatalogEntry[] | null,
  source: string,
): ActionCatalogEntry | null {
  return catalog?.find((entry) => entry.id === source) ?? null;
}

export interface FocusPanelProps {
  focus: FocusContextValue;
  text?: FocusText;
  surface?: "game" | "talk" | "web";
  managementLink?: ReactNode;
  className?: string;
}
const PanelContext = createContext<FocusPanelProps | null>(null);
function usePanel(): FocusPanelProps {
  const panel = useContext(PanelContext);
  if (!panel) throw new Error("FocusPanel context missing");
  return panel;
}
function usePanelFocus(): FocusContextValue {
  return usePanel().focus;
}
export function FocusPanel(props: FocusPanelProps): ReactNode {
  return (
    <PanelContext.Provider value={props}>
      <FocusTextProvider text={props.text}>
        <Panel
          key={props.focus.viewerId ?? "signed-out"}
          className={props.className}
        />
      </FocusTextProvider>
    </PanelContext.Provider>
  );
}

interface PanelProps {
  className?: string;
}

function Panel({ className }: PanelProps): ReactNode {
  const focus = usePanelFocus();
  const { managementLink } = usePanel();
  const { state } = focus;
  const [picking, setPicking] = useState<Picking | null>(null);
  const panel = (view: string, body: ReactNode) => (
    <div className={cn(PANEL, className)} data-focus-view={view}>
      {body}
      {managementLink}
    </div>
  );

  if (state.finished) return panel("finished", <FinishedView />);
  if (state.conflict && focus.pendingStart) {
    return panel(
      "conflict",
      <ConflictView conflict={state.conflict} requested={focus.pendingStart} />,
    );
  }
  if (state.active && !picking) {
    return panel(
      "running",
      <RunningView
        active={state.active}
        onSwitch={() => setPicking({ step: "actions", replace: true })}
      />,
    );
  }
  const replace = picking?.replace ?? false;
  if (picking?.step === "study") {
    return panel(
      "study",
      <StudyStep
        replace={replace}
        onBack={() => setPicking({ step: "actions", replace })}
        onStarted={() => setPicking(null)}
      />,
    );
  }
  return panel(
    "picker",
    <PickerView
      replace={replace}
      onStudy={() => setPicking({ step: "study", replace })}
      onStarted={() => setPicking(null)}
      onBack={state.active ? () => setPicking(null) : undefined}
    />,
  );
}

const PANEL = "flex min-h-0 flex-col gap-3 p-3 text-sm";

function FailureNote(): ReactNode {
  const { state } = usePanelFocus();
  const { t } = useFocusText();
  if (!state.failed) return null;
  return (
    <p className="text-destructive text-xs" role="status">
      {t("focus.failed")}
    </p>
  );
}

interface PickerViewProps {
  replace: boolean;
  onStudy: () => void;
  onStarted: () => void;
  onBack?: () => void;
}

function PickerView({
  replace,
  onStudy,
  onStarted,
  onBack,
}: PickerViewProps): ReactNode {
  const focus = usePanelFocus();
  const { catalog, catalogFailed, state } = focus;
  const { t } = useFocusText();
  const running = state.active;

  const startPlain = async (entry: ActionCatalogEntry) => {
    const outcome = await focus.start({ source: entry.id, replace });
    if (outcome !== "failed") onStarted();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("focus.running")}
            onClick={onBack}
          >
            <ChevronLeft className="rtl:-scale-x-100" aria-hidden="true" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm">{t("focus.pickerTitle")}</h2>
          <p className="text-muted-foreground text-xs">
            {replace && running
              ? t("focus.switchNote", {
                  action: actionHeadline(running, t("focus.title")),
                })
              : t("focus.description")}
          </p>
        </div>
      </div>
      {catalog === null ? (
        <p className="text-muted-foreground text-xs" role="status">
          {catalogFailed ? t("focus.catalogFailed") : t("focus.catalogLoading")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1" data-focus-catalog="">
          {catalog
            .filter(
              (entry) => entry.id !== running?.source || entry.requiresSubject,
            )
            .map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2"
                data-focus-action={entry.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{entry.label}</div>
                  <p className="text-muted-foreground text-xs">
                    {entry.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={entry.requiresSubject ? "outline" : "default"}
                  disabled={!focus.enabled || state.busy}
                  aria-label={
                    entry.requiresSubject
                      ? t("focus.chooseAction", { action: entry.label })
                      : t("focus.startAction", { action: entry.label })
                  }
                  onClick={() =>
                    entry.requiresSubject ? onStudy() : void startPlain(entry)
                  }
                >
                  {entry.requiresSubject ? t("focus.choose") : t("focus.start")}
                </Button>
              </li>
            ))}
        </ul>
      )}
      {state.phase === "unknown" ? (
        <p className="text-muted-foreground text-xs" role="status">
          {t("focus.sessionLoading")}
        </p>
      ) : null}
      <FailureNote />
    </>
  );
}

interface StudyStepProps {
  replace: boolean;
  onBack: () => void;
  onStarted: () => void;
}

function StudyStep({ replace, onBack, onStarted }: StudyStepProps): ReactNode {
  const focus = usePanelFocus();
  const text = useFocusText();
  const { t } = text;
  const [createFailed, setCreateFailed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [todaySeconds, setTodaySeconds] = useState<
    Record<string, number> | undefined
  >(undefined);
  useEffect(() => {
    focus.loadStudy();
  }, [focus.loadStudy]);

  const { api } = focus;
  useEffect(() => {
    setTodaySeconds(undefined);
    if (!api || !focus.enabled) return;
    let current = true;
    void api
      .summary("today")
      .then((summary) => {
        if (!current) return;
        setTodaySeconds(
          Object.fromEntries(
            summary.subjects.map((entry) => [entry.subject.id, entry.seconds]),
          ),
        );
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [api, focus.enabled]);

  const startWith = async (subjectId: string) => {
    const outcome = await focus.start({
      source: STUDY_SOURCE,
      subjectId,
      replace,
    });
    if (outcome !== "failed") onStarted();
  };

  return (
    <>
      <StudySubjectPicker
        text={text}
        catalog={focus.study.catalog}
        subjects={focus.study.subjects}
        failed={focus.study.failed}
        busy={!focus.enabled || focus.state.busy || creating}
        todaySeconds={todaySeconds}
        onBack={onBack}
        autoFocus
        onPick={(subject) => void startWith(subject.id)}
        onCreate={(request) => {
          setCreating(true);
          setCreateFailed(false);
          void focus
            .createSubject(request)
            .then((subject) => {
              if (!subject) {
                setCreateFailed(true);
                return;
              }
              return startWith(subject.id);
            })
            .finally(() => setCreating(false));
        }}
      />
      {createFailed ? (
        <p className="text-destructive text-xs" role="status">
          {t("study.createFailed")}
        </p>
      ) : null}
      <FailureNote />
    </>
  );
}

interface RunningViewProps {
  active: ActiveAction;
  onSwitch: () => void;
}

function RunningView({ active, onSwitch }: RunningViewProps): ReactNode {
  const focus = usePanelFocus();
  const elapsed = useFocusElapsed(focus.state);
  const { surface } = usePanel();
  const { formatNumber, t } = useFocusText();
  const entry = catalogEntryFor(focus.catalog, active.source);
  const xp = entry
    ? estimateActionXp(entry, {
        elapsedSeconds: elapsed,
        priorMinutes: active.priorMinutes,
        flowScore: active.flowScore,
      })
    : null;
  const headline = actionHeadline(active, t("focus.title"));

  return (
    <>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">
          {active.paused ? t("focus.paused") : t("focus.running")}
          {active.surface !== surface
            ? ` · ${t(`focus.startedIn.${active.surface}`)}`
            : ""}
        </p>
        <h2 className="truncate font-semibold text-base">
          <bdi data-user-content="">{headline}</bdi>
        </h2>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="sr-only">{t("focus.elapsed")}</span>
          <span
            className="font-semibold text-3xl tabular-nums tracking-tight"
            dir="ltr"
            data-focus-elapsed={Math.floor(elapsed)}
          >
            {formatElapsed(elapsed)}
          </span>
        </div>
        {xp !== null ? (
          <div className="text-end">
            <div className="font-semibold tabular-nums" data-focus-xp={xp}>
              {t("focus.xp", { xp: formatNumber(xp) })}
            </div>
            <div className="text-muted-foreground text-xs">
              {t("focus.flowMultiplier", {
                multiplier: formatNumber(flowMultiplier(active.flowScore)),
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!focus.enabled || focus.state.busy}
          onClick={() => void (active.paused ? focus.resume() : focus.pause())}
          data-focus-toggle-pause=""
        >
          {active.paused ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          {active.paused ? t("focus.resume") : t("focus.pause")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!focus.enabled || focus.state.busy}
          onClick={() => void focus.stop()}
          data-focus-stop=""
        >
          <Square aria-hidden="true" />
          {t("focus.stop")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!focus.enabled || focus.state.busy}
          onClick={onSwitch}
          className="ms-auto"
          data-focus-switch=""
        >
          <Repeat aria-hidden="true" />
          {t("focus.switch")}
        </Button>
      </div>
      <FailureNote />
    </>
  );
}

function FinishedView(): ReactNode {
  const focus = usePanelFocus();
  const { formatNumber, t } = useFocusText();
  const finished = focus.state.finished;
  if (!finished) return null;
  const headline = actionHeadline(finished, t("focus.title"));
  const elapsed = formatElapsed(finished.durationSeconds);
  return (
    <>
      <h2 className="font-semibold text-base">{t("focus.finishedTitle")}</h2>
      <p role="status" data-focus-granted={finished.xpGranted}>
        <bdi data-user-content="">
          {finished.xpGranted > 0
            ? t("focus.finishedSummary", {
                action: headline,
                elapsed,
                xp: formatNumber(finished.xpGranted),
              })
            : t("focus.finishedNoXp", { action: headline, elapsed })}
        </bdi>
      </p>
      <Button
        type="button"
        size="sm"
        onClick={focus.dismissFinished}
        className="self-end"
        data-focus-dismiss=""
      >
        {t("common.done")}
      </Button>
    </>
  );
}

interface ConflictViewProps {
  conflict: ActiveAction;
  requested: StartFocusOptions;
}

function ConflictView({ conflict, requested }: ConflictViewProps): ReactNode {
  const focus = usePanelFocus();
  const { t } = useFocusText();
  const entry = catalogEntryFor(focus.catalog, requested.source);
  const subject = requested.subjectId
    ? (focus.study.subjects?.find((s) => s.id === requested.subjectId) ?? null)
    : null;
  const requestedLabel = actionHeadline(
    { label: entry?.label ?? null, source: requested.source, subject },
    t("focus.title"),
  );
  return (
    <>
      <h2 className="font-semibold text-base">{t("focus.conflictTitle")}</h2>
      <p data-focus-conflict={conflict.sessionId}>
        <bdi data-user-content="">
          {t("focus.conflictBody", {
            action: actionHeadline(conflict, t("focus.title")),
            where: t(`focus.startedIn.${conflict.surface}`),
            requested: requestedLabel,
          })}
        </bdi>
      </p>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!focus.enabled || focus.state.busy}
          onClick={focus.dismissConflict}
          data-focus-conflict-keep=""
        >
          {t("focus.conflictKeep")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!focus.enabled || focus.state.busy}
          onClick={() => void focus.start({ ...requested, replace: true })}
          data-focus-conflict-switch=""
        >
          {t("focus.conflictSwitch")}
        </Button>
      </div>
      <FailureNote />
    </>
  );
}
