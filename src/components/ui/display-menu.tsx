import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../utils/cn";

function DisplayMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="display-menu"
      className={cn("flex flex-col items-start gap-1.5", className)}
      {...props}
    />
  );
}

const displayMenuItemVariants = cva(
  "flex w-fit items-baseline gap-3 text-left font-bold uppercase tracking-tight text-foreground outline-none transition-[color] duration-200 ease-(--ease-out)",
  {
    variants: {
      size: {
        lg: "text-2xl md:text-4xl",
        xl: "text-6xl leading-none md:text-8xl",
      },
      disabled: {
        true: "cursor-default",
        false: "cursor-pointer hover:text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "lg",
      disabled: false,
    },
  },
);

const displayMenuItemTrailingVariants = cva(
  "font-semibold text-muted-foreground",
  {
    variants: {
      size: {
        lg: "text-lg md:text-xl",
        xl: "text-3xl md:text-4xl",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

function DisplayMenuItem({
  className,
  size = "lg",
  disabled = false,
  trailing,
  children,
  render,
  ...props
}: useRender.ComponentProps<"button"> &
  VariantProps<typeof displayMenuItemVariants> & {
    trailing?: React.ReactNode;
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: render ? undefined : "button",
        disabled: render ? undefined : Boolean(disabled),
        "aria-disabled": disabled || undefined,
        className: cn(displayMenuItemVariants({ size, disabled }), className),
        children: (
          <>
            <span>{children}</span>
            {trailing != null && (
              <span
                data-slot="display-menu-item-trailing"
                className={displayMenuItemTrailingVariants({ size })}
              >
                {trailing}
              </span>
            )}
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "display-menu-item",
      size,
      disabled: Boolean(disabled),
    },
  });
}

export { DisplayMenu, DisplayMenuItem, displayMenuItemVariants };
