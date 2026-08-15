import type { CSSProperties } from "react";

export type StyleWithVars = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

/**
 * Builds a `style` value that carries CSS custom properties.
 *
 * React types `style` as `CSSProperties`, which has no index signature for `--*` keys, so a literal
 * containing them is rejected by the excess-property check. Passing it through this helper keeps the
 * keys checked (they must match `--${string}`) without asserting the object into a type it is not.
 */
export const cssVars = (style: StyleWithVars): CSSProperties => style;
