import { type ComponentProps, useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { HL } from "./kernel";

/** What a figure's `mount` receives: the stage it answers the pointer on, the svg it draws into, and its read-out. */
export interface LoaderHost {
  stage: HTMLElement;
  svg: SVGSVGElement;
  read: { textContent: string | null };
}

/**
 * A Hairline figure, as the `hairline-create` skill writes it: an isometric line drawing that loops and answers the pointer.
 * Loaders play the figure's own ambient loop, not its `tour`: a tour stop holds the figure still, which reads as frozen.
 */
export interface LoaderFigure {
  name: string;
  means: string;
  /** The figure's own number at intensity 0, 0.5 and 1; the loader plays it at the middle one. */
  range: readonly [low: number, middle: number, high: number];
  tour: readonly (readonly [number, number] | null)[] | null;
  mount: (
    host: LoaderHost,
    value: number,
  ) => { set: (value: number) => void; destroy: () => void };
}

export interface LoaderProps extends Omit<ComponentProps<"div">, "children"> {
  figure: LoaderFigure;
  /** Announced to screen readers while the loader is shown, e.g. "Loading the fleet". */
  label: string;
}

/** The figure's palette, taken from the page's own tokens so it sits on the background it is drawn over. */
const palette = [
  "[--hairline-plate:var(--background)]",
  "[--hairline-hi:var(--foreground)]",
  "[--hairline-edge:color-mix(in_oklch,var(--foreground)_42%,var(--background))]",
  "[--hairline-mid:color-mix(in_oklch,var(--foreground)_22%,var(--background))]",
  "[--hairline-lo:color-mix(in_oklch,var(--foreground)_10%,var(--background))]",
];

/**
 * How long an unmounted loader's figure keeps its place, so a loader for the same figure that mounts
 * in the next moment (a page swapping one loading state for the next) carries on with the same loop.
 */
const HANDOFF_MS = 1500;

interface Running {
  stage: HTMLElement;
  destroy: () => void;
  timer?: ReturnType<typeof setTimeout>;
}

const parked = new Map<LoaderFigure, Running>();

function start(figure: LoaderFigure, doc: Document): Running {
  HL.inject(doc);
  const stage = doc.createElement("div");
  stage.dataset.hairline = figure.name;
  stage.className = "block aspect-[5/4] w-full";
  const svg: SVGSVGElement = HL.mk(
    "svg",
    { viewBox: "0 0 400 320", "aria-hidden": "true" },
    stage,
  );
  const handle = figure.mount(
    { stage, svg, read: { textContent: null } },
    figure.range[1],
  );
  return {
    stage,
    destroy: () => {
      handle.destroy();
      stage.remove();
    },
  };
}

/**
 * A page-level loading animation: a Hairline figure playing its own loop. It holds its rest pose under
 * reduced motion, and server-renders as an empty 5:4 box so nothing shifts when it draws.
 */
export function Loader({ figure, label, className, ...props }: LoaderProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const waiting = parked.get(figure);
    parked.delete(figure);
    clearTimeout(waiting?.timer);
    const running = waiting ?? start(figure, host.ownerDocument);
    host.append(running.stage);
    return () => {
      running.stage.remove();
      const previous = parked.get(figure);
      if (previous) {
        clearTimeout(previous.timer);
        previous.destroy();
      }
      running.timer = setTimeout(() => {
        if (parked.get(figure) === running) parked.delete(figure);
        running.destroy();
      }, HANDOFF_MS);
      parked.set(figure, running);
    };
  }, [figure]);

  return (
    <div
      role="status"
      className={cn("relative w-56 max-w-full", palette, className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <div ref={hostRef} className="aspect-[5/4] w-full" />
    </div>
  );
}
