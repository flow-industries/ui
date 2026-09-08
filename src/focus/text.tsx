import { createContext, type ReactNode, useContext } from "react";

type TextEntry = string | { one: string; other: string };

const CATALOG = {
  "common.done": "Done",
  "focus.title": "Focus",
  "focus.description": "Start an action and earn XP without entering a room.",
  "focus.pickerTitle": "Start an action",
  "focus.catalogLoading": "Loading actions…",
  "focus.catalogFailed": "Actions are unavailable right now.",
  "focus.sessionLoading": "Checking for a running action…",
  "focus.start": "Start",
  "focus.startAction": "Start {action}",
  "focus.choose": "Choose…",
  "focus.chooseAction": "Choose what to {action}",
  "focus.running": "In progress",
  "focus.paused": "Paused",
  "focus.pause": "Pause",
  "focus.resume": "Resume",
  "focus.stop": "Stop",
  "focus.switch": "Switch…",
  "focus.switchNote": "Stopping {action} grants its XP now.",
  "focus.elapsed": "Elapsed",
  "focus.xp": "+{xp} XP",
  "focus.flowMultiplier": "Flow Score ×{multiplier}",
  "focus.startedIn.game": "Started in the game",
  "focus.startedIn.talk": "Started in Talk",
  "focus.startedIn.web": "Started on the web",
  "focus.pill":
    "{action}, {elapsed} elapsed, about {xp} XP. Open the running action.",
  "focus.pillPaused":
    "{action}, paused at {elapsed}, about {xp} XP. Open the running action.",
  "focus.finishedTitle": "Nice work",
  "focus.finishedSummary": "{action} · {elapsed} · +{xp} XP",
  "focus.finishedNoXp":
    "{action} · {elapsed} · too short to earn XP this time.",
  "focus.conflictTitle": "Already in progress",
  "focus.conflictBody":
    "{action} is running ({where}). Switch to {requested}? The running action stops and gets its XP.",
  "focus.conflictSwitch": "Switch",
  "focus.conflictKeep": "Keep going",
  "focus.failed": "That didn't go through — try again.",
  "study.title": "What are you practicing today?",
  "study.description": "Each subject keeps its own time.",
  "study.searchLabel": "Search subjects",
  "study.searchPlaceholder": "Search, e.g. Chinese",
  "study.recent": "Recent",
  "study.browse": "Browse",
  "study.results": "Results",
  "study.noResults": "Nothing matches “{query}”.",
  "study.addOwn": "Add your own",
  "study.addNamed": "Add “{name}”",
  "study.addName": "Subject name",
  "study.addNamePlaceholder": "e.g. Math for my test",
  "study.addCategory": "Category (optional)",
  "study.addCategoryNone": "No category",
  "study.addSubmit": "Add and start",
  "study.allCategories": "All categories",
  "study.alias": "also “{alias}”",
  "study.todayMinutes": "today: {minutes} min",
  "study.loading": "Loading subjects…",
  "study.failed": "Subjects are unavailable right now.",
  "study.pickSubject": "Start practicing {subject}",
  "study.openCategory": "Browse {category}",
  "study.fieldCount": { one: "{count} field", other: "{count} fields" },
  "study.optionCount": { one: "{count} option", other: "{count} options" },
  "study.createFailed": "Couldn't add that subject — try again.",
} as const satisfies Record<string, TextEntry>;

export type FocusTextKey = keyof typeof CATALOG;

export type TextValues = Record<string, string | number | null | undefined>;
export interface FocusText {
  t: (key: FocusTextKey, values?: TextValues, count?: number) => string;
  formatNumber: (value: number) => string;
}
export function isolateBidi(value: string | number): string {
  return `\u2068${value}\u2069`;
}
export function createFocusText(
  locale = "en",
  messages: Partial<Record<FocusTextKey, TextEntry>> = {},
): FocusText {
  const numbers = new Intl.NumberFormat(locale);
  const plurals = new Intl.PluralRules(locale);
  return {
    formatNumber: (value) => numbers.format(value),
    t(key, values = {}, count) {
      const entry: TextEntry = messages[key] ?? CATALOG[key];
      let template: string;
      // biome-ignore lint: TextEntry is an explicit public string-or-plural contract.
      if (typeof entry === "string") template = entry;
      else if (plurals.select(count ?? 0) === "one") template = entry.one;
      else template = entry.other;
      return template.replace(/\{([^}]+)\}/g, (_match, name: string) =>
        String(values[name] ?? ""),
      );
    },
  };
}
export const defaultFocusText = createFocusText();
const FocusTextContext = createContext(defaultFocusText);
interface FocusTextProviderProps {
  text?: FocusText;
  children: ReactNode;
}

export function FocusTextProvider({
  text = defaultFocusText,
  children,
}: FocusTextProviderProps): ReactNode {
  return (
    <FocusTextContext.Provider value={text}>
      {children}
    </FocusTextContext.Provider>
  );
}
export function useFocusText(): FocusText {
  return useContext(FocusTextContext);
}
