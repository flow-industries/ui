import type * as React from "react";
import { useEffect } from "react";

type ScrollTarget = HTMLElement | React.RefObject<HTMLElement | null> | null;

function resolveTarget(target: ScrollTarget | undefined): HTMLElement | null {
  if (!target) return null;
  return target instanceof HTMLElement ? target : target.current;
}

const TRANSPARENT = /^(transparent|rgba\(.*,\s*0\)|.*\/\s*0\))$/;

/** The first painted background from `from` up through its ancestors. */
function pageBackground(from: Element): string | null {
  for (let node: Element | null = from; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color && !TRANSPARENT.test(color)) return color;
  }
  return null;
}

/**
 * Paints `edge` with the page's actual background as `--flow-fade-color` and,
 * with `scroll`, sets `data-scrolled` on it once content has scrolled under it.
 * The colour is read from the page, not a token, because an app or framework
 * can paint a background of its own; it is re-read when the theme changes.
 */
function useScrollEdge(
  edge: React.RefObject<HTMLElement | null>,
  { target, scroll }: { target?: ScrollTarget; scroll: boolean },
) {
  useEffect(() => {
    const element = edge.current;
    if (!element) return;
    const scroller = resolveTarget(target);
    const start = scroller ?? document.body;

    const paint = () => {
      const color = pageBackground(start);
      if (color) element.style.setProperty("--flow-fade-color", color);
      else element.style.removeProperty("--flow-fade-color");
    };
    const sync = () =>
      element.toggleAttribute(
        "data-scrolled",
        (scroller ? scroller.scrollTop : window.scrollY) > 0,
      );

    paint();
    const themeObserver = new MutationObserver(paint);
    const attributeFilter = ["class", "style", "data-theme"];
    themeObserver.observe(document.documentElement, { attributeFilter });
    themeObserver.observe(document.body, { attributeFilter });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", paint);
    // A theme switch can animate the background; read it again once it settles.
    const settle = (event: TransitionEvent) => {
      if (
        event.propertyName === "background-color" &&
        event.target instanceof Node &&
        event.target.contains(start)
      )
        paint();
    };
    document.addEventListener("transitionend", settle);

    const source = scroller ?? window;
    if (scroll) {
      sync();
      source.addEventListener("scroll", sync, { passive: true });
    }

    return () => {
      themeObserver.disconnect();
      scheme.removeEventListener("change", paint);
      document.removeEventListener("transitionend", settle);
      source.removeEventListener("scroll", sync);
      element.removeAttribute("data-scrolled");
    };
  }, [edge, target, scroll]);
}

export { type ScrollTarget, useScrollEdge };
