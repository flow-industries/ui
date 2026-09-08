import {
  type ActiveAction,
  createFocusApi,
  type FocusApi,
  type StudySubject,
} from "@flow-industries/id/focus";
import { type ReactNode, useMemo, useState } from "react";
import { Button } from "../src/components/ui/button";
import { FocusPanel, FocusProvider, useFocus } from "../src/focus";

const catalog = {
  version: 1,
  categories: [
    {
      slug: "languages",
      label: "Languages",
      fields: [
        { slug: "languages/chinese", label: "Chinese", aliases: ["Mandarin"] },
      ],
    },
  ],
};

function createDemoApi(viewer: string): FocusApi {
  const base = createFocusApi(
    "https://unused.invalid",
    async () => null,
    "web",
  );
  const key = `focus-showcase-${viewer}`;
  function read(): ActiveAction | null {
    // SAFETY: This showcase reads only the session shape it writes under its viewer-specific key.
    const saved = JSON.parse(localStorage.getItem(key) ?? "null") as
      | (ActiveAction & { sampledAt?: number })
      | null;
    if (!saved) return null;
    if (!saved.paused)
      saved.accruedSeconds +=
        (Date.now() - (saved.sampledAt ?? Date.now())) / 1000;
    return saved;
  }
  async function respond<T>(value: T): Promise<T> {
    await new Promise((resolve) =>
      setTimeout(resolve, Number(localStorage.getItem("focus-delay") ?? 0)),
    );
    if (localStorage.getItem("focus-failure") === "true")
      throw new Error("Demo unavailable");
    return value;
  }
  const subjects: StudySubject[] = JSON.parse(
    localStorage.getItem(`${key}-subjects`) ?? "null",
  ) ?? [
    {
      id: `${viewer}-chinese`,
      field: "languages/chinese",
      name: `${viewer}'s Chinese`,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    },
  ];
  return {
    ...base,
    catalog: () =>
      respond({
        actions: [
          {
            id: "action.study",
            label: "Practice",
            description: "Practice a subject",
            mode: "linear",
            base: 10,
            flowMultiplier: true,
            userStartable: true,
            requiresSubject: true,
          },
          {
            id: "game.action.meditation",
            label: "Meditation",
            description: "Take a moment",
            mode: "linear",
            base: 10,
            flowMultiplier: true,
            userStartable: true,
            requiresSubject: false,
          },
        ],
      }),
    active: () => respond(read()),
    studyCatalog: () => respond(catalog),
    subjects: () => respond({ subjects }),
    async createSubject(request) {
      const subject = {
        ...subjects[0],
        id: crypto.randomUUID(),
        name: request.name ?? "Chinese",
        field: request.field ?? null,
      };
      await respond(null);
      subjects.push(subject);
      localStorage.setItem(`${key}-subjects`, JSON.stringify(subjects));
      return { subject };
    },
    async start(request) {
      const previous = read();
      if (previous && !request.replace)
        return respond({ error: "active_session", active: previous });
      const subject = subjects.find((item) => item.id === request.subjectId);
      const session: ActiveAction = {
        sessionId: crypto.randomUUID(),
        source: request.source,
        label: request.source === "action.study" ? "Practice" : "Meditation",
        surface: "web",
        startedAt: new Date().toISOString(),
        paused: false,
        accruedSeconds: 90,
        subject: subject
          ? { id: subject.id, name: subject.name, field: subject.field }
          : null,
        priorMinutes: 0,
        flowScore: 0,
      };
      await respond(null);
      localStorage.setItem(
        key,
        JSON.stringify({ ...session, sampledAt: Date.now() }),
      );
      return { session };
    },
    async event(request) {
      const active = read();
      await respond(null);
      if (active && active.sessionId === request.sessionId) {
        if (request.kind === "pause") active.paused = true;
        if (request.kind === "resume") active.paused = false;
        localStorage.setItem(
          key,
          JSON.stringify({ ...active, sampledAt: Date.now() }),
        );
      }
      return { ok: true, recorded: true };
    },
    async finish() {
      const active = read();
      await respond(null);
      localStorage.removeItem(key);
      return {
        ok: true,
        sessionId: active?.sessionId ?? "",
        source: active?.source ?? "action.study",
        label: active?.label ?? "Practice",
        subject: active?.subject ?? null,
        xpGranted: 12,
        durationSeconds: Math.floor(active?.accruedSeconds ?? 0),
      };
    },
    summary: async (range) =>
      respond({
        range,
        categories: [],
        total: { seconds: viewer === "Alice" ? 420 : 120, sessions: 1 },
        subjects: subjects.map((subject) => ({
          subject,
          focusedSeconds: viewer === "Alice" ? 420 : 120,
          sessions: 1,
          lastAt: subject.createdAt,
          seconds: viewer === "Alice" ? 420 : 120,
        })),
      }),
  };
}

function DemoPanel(): ReactNode {
  const focus = useFocus();
  return (
    <>
      <Button variant="outline" onClick={focus.refresh}>
        Reload session
      </Button>
      <FocusPanel
        focus={focus}
        surface="web"
        managementLink={<a href="#focus">Practice statistics</a>}
      />
    </>
  );
}

export function FocusShowcase(): ReactNode {
  const [viewer, setViewer] = useState<string | null>("Alice");
  const [failure, setFailure] = useState(
    localStorage.getItem("focus-failure") === "true",
  );
  const [delay, setDelay] = useState(
    localStorage.getItem("focus-delay") === "1000",
  );
  const [dark, setDark] = useState(false);
  const api = useMemo(() => createDemoApi(viewer ?? "Guest"), [viewer]);
  return (
    <main
      className={`min-h-screen bg-background p-4 text-foreground ${dark ? "dark" : ""}`}
    >
      <h1 className="mb-4 font-semibold text-xl">Focus</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setViewer(viewer === "Alice" ? "Bob" : "Alice")}
        >
          Switch account
        </Button>
        <Button
          variant="outline"
          onClick={() => setViewer(viewer ? null : "Alice")}
        >
          {viewer ? "Sign out" : "Sign in"}
        </Button>
        <Button
          variant="outline"
          aria-pressed={failure}
          onClick={() => {
            localStorage.setItem("focus-failure", String(!failure));
            setFailure(!failure);
          }}
        >
          Simulate errors
        </Button>
        <Button
          variant="outline"
          aria-pressed={delay}
          onClick={() => {
            localStorage.setItem("focus-delay", delay ? "0" : "1000");
            setDelay(!delay);
          }}
        >
          Slow responses
        </Button>
        <Button variant="outline" onClick={() => setDark(!dark)}>
          Toggle theme
        </Button>
      </div>
      <p className="mb-4">{viewer ?? "Guest"}</p>
      <div className="max-w-sm rounded-lg border border-border bg-card">
        <FocusProvider api={api} viewerId={viewer}>
          <DemoPanel />
        </FocusProvider>
      </div>
    </main>
  );
}
