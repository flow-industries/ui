import type {
  StudyCatalog,
  StudyCategory,
  StudyField,
  StudySubject,
} from "@flow-industries/id/focus";
import {
  recentSubjects,
  type StudySearchHit,
  searchStudy,
} from "@flow-industries/id/focus";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../utils/cn";
import {
  type FocusText,
  FocusTextProvider,
  isolateBidi,
  useFocusText,
} from "./text";

const CLAIM_FOCUS_RETRY_MS = 30;
const CLAIM_FOCUS_ATTEMPTS = 6;

/** Moves focus to `ref` when `enabled` turns on. One `focus()` is not enough
 * here: the Base UI popup that hosts this picker re-homes focus onto itself
 * on the frame after a focused child unmounts (the button that opened this
 * step, the search input the add form replaces), so the claim is retried for
 * a few frames until it holds. */
function useClaimFocus(
  ref: RefObject<HTMLInputElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const input = ref.current;
    if (!input) return;
    let attempts = 0;
    let timer = 0;
    const claim = () => {
      if (
        document.activeElement === input ||
        attempts >= CLAIM_FOCUS_ATTEMPTS
      ) {
        return;
      }
      attempts += 1;
      input.focus();
      timer = window.setTimeout(claim, CLAIM_FOCUS_RETRY_MS);
    };
    claim();
    return () => window.clearTimeout(timer);
  }, [ref, enabled]);
}

export interface StudySubjectPickerProps {
  text?: FocusText;
  catalog: StudyCatalog | null;
  subjects: StudySubject[] | null;
  /** Data could not be loaded; the picker still offers "Add your own". */
  failed?: boolean;
  /** A start or create is in flight — options stay visible but inert. */
  busy?: boolean;
  /** Seconds studied today per subject id, rendered as "today: 42 min".
   * Omitted until the summary API exists; the row simply shows nothing. */
  todaySeconds?: Record<string, number>;
  onPick: (subject: StudySubject) => void;
  onCreate: (request: { name?: string; field?: string }) => void;
  /** Rendered as the leading back control when the host has a previous step. */
  onBack?: () => void;
  autoFocus?: boolean;
  className?: string;
}

type PickerOption =
  | { kind: "subject"; id: string; subject: StudySubject }
  | {
      kind: "field";
      id: string;
      field: StudyField;
      category: StudyCategory;
      alias: string | null;
    }
  | { kind: "category"; id: string; category: StudyCategory }
  | { kind: "add"; id: string; name: string | null };

type OptionGroup = {
  key: string;
  label: string | null;
  options: PickerOption[];
};

function subjectOption(subject: StudySubject): PickerOption {
  return { kind: "subject", id: `subject:${subject.id}`, subject };
}

function hitOption(hit: StudySearchHit): PickerOption {
  if (hit.kind === "subject") {
    return { kind: "subject", id: `subject:${hit.id}`, subject: hit.subject };
  }
  return {
    kind: "field",
    id: `field:${hit.id}`,
    field: hit.ref.field,
    category: hit.ref.category,
    alias: hit.alias,
  };
}

export function StudySubjectPicker(props: StudySubjectPickerProps): ReactNode {
  return (
    <FocusTextProvider text={props.text}>
      <Picker {...props} />
    </FocusTextProvider>
  );
}

function Picker({
  catalog,
  subjects,
  failed = false,
  busy = false,
  todaySeconds,
  onPick,
  onCreate,
  onBack,
  autoFocus = false,
  className,
}: StudySubjectPickerProps): ReactNode {
  const { formatNumber, t } = useFocusText();
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmedQuery = query.trim();

  const category = useMemo(
    () =>
      categorySlug && catalog
        ? (catalog.categories.find((c) => c.slug === categorySlug) ?? null)
        : null,
    [catalog, categorySlug],
  );

  const groups = useMemo<OptionGroup[]>(() => {
    const liveSubjects = subjects ?? [];
    if (trimmedQuery) {
      const needle = trimmedQuery.toLowerCase();
      const results = catalog
        ? searchStudy(trimmedQuery, { catalog, subjects: liveSubjects }).map(
            hitOption,
          )
        : liveSubjects
            .filter((s) => s.name.toLowerCase().includes(needle))
            .map(subjectOption);
      return [
        {
          key: "results",
          label: t("study.results"),
          options: results,
        },
        {
          key: "add",
          label: null,
          options: [{ kind: "add", id: "add:named", name: trimmedQuery }],
        },
      ];
    }
    if (category) {
      return [
        {
          key: `category:${category.slug}`,
          label: category.label,
          options: category.fields.map((field) => ({
            kind: "field" as const,
            id: `field:${field.slug}`,
            field,
            category,
            alias: null,
          })),
        },
      ];
    }
    const recent = recentSubjects(liveSubjects);
    const result: OptionGroup[] = [];
    if (recent.length > 0) {
      result.push({
        key: "recent",
        label: t("study.recent"),
        options: recent.map(subjectOption),
      });
    }
    if (catalog) {
      result.push({
        key: "browse",
        label: t("study.browse"),
        options: catalog.categories.map((c) => ({
          kind: "category" as const,
          id: `category:${c.slug}`,
          category: c,
        })),
      });
    }
    result.push({
      key: "add",
      label: null,
      options: [{ kind: "add", id: "add:own", name: null }],
    });
    return result;
  }, [catalog, category, subjects, t, trimmedQuery]);

  const options = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const clampedIndex = Math.min(activeIndex, Math.max(0, options.length - 1));
  const activeOption = options[clampedIndex] ?? null;
  const listId = `${baseId}-listbox`;
  const optionDomId = (option: PickerOption) =>
    `${baseId}-${option.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  useClaimFocus(inputRef, autoFocus && adding === null);

  useEffect(() => {
    if (!activeOption) return;
    document
      .getElementById(optionDomId(activeOption))
      ?.scrollIntoView({ block: "nearest" });
  });

  const optionLabel = (option: PickerOption): string => {
    switch (option.kind) {
      case "subject":
        return t("study.pickSubject", { subject: option.subject.name });
      case "field":
        return `${t("study.pickSubject", { subject: option.field.label })} · ${option.category.label}`;
      case "category":
        return t("study.openCategory", { category: option.category.label });
      case "add":
        return option.name
          ? t("study.addNamed", { name: option.name })
          : t("study.addOwn");
    }
  };

  const choose = (option: PickerOption) => {
    if (busy) return;
    switch (option.kind) {
      case "subject":
        onPick(option.subject);
        return;
      case "field":
        onCreate({ field: option.field.slug });
        return;
      case "category":
        setCategorySlug(option.category.slug);
        setActiveIndex(0);
        return;
      case "add":
        setAdding(option.name ?? "");
        return;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(
          options.length ? (clampedIndex + 1) % options.length : 0,
        );
        return;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          options.length
            ? (clampedIndex - 1 + options.length) % options.length
            : 0,
        );
        return;
      case "Home":
        if (!query) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case "End":
        if (!query) {
          event.preventDefault();
          setActiveIndex(Math.max(0, options.length - 1));
        }
        return;
      case "Enter":
        if (activeOption) {
          event.preventDefault();
          choose(activeOption);
        }
        return;
      case "Escape":
        if (query) {
          event.preventDefault();
          event.stopPropagation();
          setQuery("");
          setActiveIndex(0);
        } else if (category) {
          event.preventDefault();
          event.stopPropagation();
          setCategorySlug(null);
          setActiveIndex(0);
        }
        return;
    }
  };

  if (adding !== null) {
    return (
      <AddSubjectForm
        catalog={catalog}
        initialName={adding}
        busy={busy}
        onSubmit={onCreate}
        onBack={() => setAdding(null)}
        className={className}
      />
    );
  }

  const loading = !failed && (subjects === null || catalog === null);
  let statusMessage: string | null = null;
  if (loading) statusMessage = t("study.loading");
  else if (failed) statusMessage = t("study.failed");

  let back: { label: string; onClick: () => void } | null = null;
  if (category) {
    back = {
      label: t("study.allCategories"),
      onClick: () => {
        setCategorySlug(null);
        setActiveIndex(0);
        inputRef.current?.focus();
      },
    };
  } else if (onBack) {
    back = { label: t("focus.pickerTitle"), onClick: onBack };
  }

  return (
    <div
      className={cn("flex min-h-0 flex-col gap-2", className)}
      data-study-picker=""
    >
      <div className="flex items-center gap-1">
        {back ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={back.label}
            onClick={back.onClick}
          >
            <ChevronLeft className="rtl:-scale-x-100" aria-hidden="true" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-sm">{t("study.title")}</h2>
          <p className="text-muted-foreground text-xs">
            {t("study.description")}
          </p>
        </div>
      </div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 start-2.5 my-auto size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          role="combobox"
          aria-label={t("study.searchLabel")}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeOption ? optionDomId(activeOption) : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder={t("study.searchPlaceholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          className="h-9 ps-8 text-sm md:text-sm"
          data-study-search=""
        />
      </div>
      <span className="sr-only" role="status">
        {t(
          "study.optionCount",
          { count: formatNumber(options.length) },
          options.length,
        )}
      </span>
      {statusMessage ? (
        <p className="px-1 text-muted-foreground text-xs" role="status">
          {statusMessage}
        </p>
      ) : null}
      <div
        id={listId}
        role="listbox"
        aria-label={t("study.title")}
        aria-busy={busy || undefined}
        className="-mx-1 max-h-72 min-h-0 overflow-y-auto overscroll-contain px-1"
        data-study-options={options.length}
      >
        {groups.map((group) => {
          if (group.options.length === 0) {
            if (group.key !== "results") return null;
            return (
              <p
                key={group.key}
                className="px-2 py-2 text-muted-foreground text-xs"
              >
                {t("study.noResults", { query: trimmedQuery })}
              </p>
            );
          }
          return (
            <div key={group.key} className="pt-1 first:pt-0">
              {group.label ? (
                <div
                  aria-hidden="true"
                  className="px-2 pt-1.5 pb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide"
                >
                  {group.label}
                </div>
              ) : null}
              {group.options.map((option) => {
                const active = activeOption?.id === option.id;
                return (
                  <button
                    key={option.id}
                    id={optionDomId(option)}
                    type="button"
                    role="option"
                    tabIndex={-1}
                    aria-selected={active}
                    aria-label={optionLabel(option)}
                    aria-disabled={busy || undefined}
                    data-study-option={option.kind}
                    data-study-option-id={option.id}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => {
                      const index = options.findIndex(
                        (o) => o.id === option.id,
                      );
                      if (index >= 0 && index !== clampedIndex) {
                        setActiveIndex(index);
                      }
                    }}
                    onClick={() => choose(option)}
                    className={cn(
                      "flex min-h-9 pointer-coarse:min-h-11 w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none",
                      active && "bg-muted text-foreground",
                      busy && "opacity-60",
                    )}
                  >
                    <OptionBody option={option} todaySeconds={todaySeconds} />
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OptionBodyProps {
  option: PickerOption;
  todaySeconds?: Record<string, number>;
}

function OptionBody({ option, todaySeconds }: OptionBodyProps): ReactNode {
  const { formatNumber, t } = useFocusText();
  switch (option.kind) {
    case "subject": {
      const seconds = todaySeconds?.[option.subject.id];
      return (
        <>
          <span className="min-w-0 flex-1 truncate">
            <bdi data-user-content="">{option.subject.name}</bdi>
          </span>
          {seconds !== undefined && seconds > 0 ? (
            <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
              {t("study.todayMinutes", {
                minutes: formatNumber(Math.round(seconds / 60)),
              })}
            </span>
          ) : null}
        </>
      );
    }
    case "field":
      return (
        <>
          <span className="min-w-0 flex-1 truncate">
            {option.field.label}
            {option.alias ? (
              <span className="ms-1.5 text-muted-foreground text-xs">
                {t("study.alias", { alias: option.alias })}
              </span>
            ) : null}
          </span>
          <span className="shrink-0 text-muted-foreground text-xs">
            {option.category.label}
          </span>
        </>
      );
    case "category":
      return (
        <>
          <span className="min-w-0 flex-1 truncate">
            {option.category.label}
          </span>
          <span className="shrink-0 text-muted-foreground text-xs">
            {t(
              "study.fieldCount",
              { count: formatNumber(option.category.fields.length) },
              option.category.fields.length,
            )}
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
            aria-hidden="true"
          />
        </>
      );
    case "add":
      return (
        <>
          <Plus
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">
            {option.name
              ? t("study.addNamed", { name: isolateBidi(option.name) })
              : t("study.addOwn")}
          </span>
        </>
      );
  }
}

interface AddSubjectFormProps {
  catalog: StudyCatalog | null;
  initialName: string;
  busy: boolean;
  onSubmit: (request: { name: string; field?: string }) => void;
  onBack: () => void;
  className?: string;
}

function AddSubjectForm({
  catalog,
  initialName,
  busy,
  onSubmit,
  onBack,
  className,
}: AddSubjectFormProps): ReactNode {
  const { t } = useFocusText();
  const nameId = useId();
  const categoryId = useId();
  const [name, setName] = useState(initialName);
  const [categorySlug, setCategorySlug] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useClaimFocus(nameRef, true);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    onSubmit(
      categorySlug ? { name: trimmed, field: categorySlug } : { name: trimmed },
    );
  };

  return (
    <form
      onSubmit={submit}
      className={cn("flex flex-col gap-3", className)}
      data-study-add-form=""
    >
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("study.title")}
          onClick={onBack}
        >
          <ChevronLeft className="rtl:-scale-x-100" aria-hidden="true" />
        </Button>
        <h2 className="font-semibold text-sm">{t("study.addOwn")}</h2>
      </div>
      <FieldRow id={nameId} label={t("study.addName")}>
        <Input
          ref={nameRef}
          id={nameId}
          value={name}
          maxLength={80}
          required
          placeholder={t("study.addNamePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          className="h-9 text-sm md:text-sm"
          data-study-add-name=""
        />
      </FieldRow>
      <FieldRow id={categoryId} label={t("study.addCategory")}>
        <select
          id={categoryId}
          value={categorySlug}
          onChange={(event) => setCategorySlug(event.target.value)}
          className="h-9 pointer-coarse:min-h-11 w-full rounded-lg border-[length:var(--border-width)] border-transparent bg-input px-2 text-sm outline-none focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-focus focus-visible:bg-input-focus"
          data-study-add-category=""
        >
          <option value="">{t("study.addCategoryNone")}</option>
          {catalog?.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>
      </FieldRow>
      <Button
        type="submit"
        size="sm"
        disabled={busy || !name.trim()}
        data-study-add-submit=""
      >
        {t("study.addSubmit")}
      </Button>
    </form>
  );
}

interface FieldRowProps {
  id: string;
  label: string;
  children: ReactNode;
}

function FieldRow({ id, label, children }: FieldRowProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-muted-foreground text-xs">
        {label}
      </label>
      {children}
    </div>
  );
}
