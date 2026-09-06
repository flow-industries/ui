import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";

import { cn } from "../../utils/cn";
import { Logo } from "../logo";

function Header({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="header"
      className={cn("flex items-center justify-between gap-4", className)}
      {...props}
    />
  );
}

const brandSizes = {
  sm: {
    logo: 16,
    gap: "gap-1.5",
    text: "text-sm tracking-widest",
    label: "ml-0.5",
  },
  default: {
    logo: 20,
    gap: "gap-2",
    text: "text-lg tracking-widest",
    label: "ml-0.5",
  },
  lg: {
    logo: 38,
    gap: "gap-3",
    text: "text-2xl tracking-[0.2em]",
    label: "ml-1",
  },
} as const;

type HeaderBrandSize = keyof typeof brandSizes;

type HeaderBrandProps = useRender.ComponentProps<"span"> & {
  label: string;
  start?: string;
  size?: HeaderBrandSize;
  logoSize?: number;
};

function HeaderBrand({
  className,
  label,
  start = "FLOW",
  size = "default",
  logoSize,
  render,
  onClick,
  ...props
}: HeaderBrandProps) {
  const s = brandSizes[size];
  // A bare brand is static text; rendered as a link or button it needs the
  // same touch floor and focus border as every other control.
  const interactive = render !== undefined || onClick !== undefined;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(
          "inline-flex items-center leading-tight text-foreground",
          s.gap,
          interactive &&
            "-m-0.5 rounded-sm border-[length:var(--border-width)] border-transparent outline-none pointer-coarse:min-h-11 focus-visible:border-focus",
          className,
        ),
        onClick,
        children: (
          <>
            <Logo size={logoSize ?? s.logo} />
            <span className={cn("uppercase", s.text)}>
              <span className="font-extralight">{start}</span>
              <span className={cn("font-semibold", s.label)}>{label}</span>
            </span>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "header-brand",
      size,
    },
  });
}

function HeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="header-actions"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    />
  );
}

export type { HeaderBrandProps, HeaderBrandSize };
export { Header, HeaderActions, HeaderBrand };
