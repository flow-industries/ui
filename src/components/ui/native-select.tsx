import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../../utils/cn";

// Size classes are emitted as plain utilities rather than `data-[size=...]:`
// rules so tailwind-merge can drop them for a consumer's own height class. An
// attribute-scoped rule outranks a bare class on specificity, so `h-11` from a
// consumer would land in the stylesheet and still lose (UI-45).
const nativeSelectVariants = cva(
  "w-full min-w-0 appearance-none rounded-lg border-[length:var(--border-width)] border-transparent bg-input pr-8 pl-2.5 text-sm transition-colors outline-none select-none pointer-coarse:min-h-11 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-focus disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
  {
    variants: {
      size: {
        default: "h-10 py-1",
        sm: "h-7 rounded-[min(var(--radius-md),10px)] py-0.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> &
  VariantProps<typeof nativeSelectVariants> & {
    containerClassName?: string;
  };

// `className` styles the `<select>` — the box a consumer sees and means when
// they pass `h-11` (UI-46). The wrapper only anchors the chevron overlay, so
// classes that place the control inside its parent's layout (width, margin,
// flex or grid placement) go to `containerClassName`.
function NativeSelect({
  className,
  containerClassName,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        containerClassName,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(nativeSelectVariants({ size, className }))}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
