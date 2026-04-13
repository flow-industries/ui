import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "../../utils/cn"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150 ease-(--ease-out) outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-primary aria-invalid:border-destructive data-[size=default]:h-[26px] data-[size=default]:w-[46px] data-[size=default]:px-[3px] data-[size=sm]:h-[19px] data-[size=sm]:w-[34px] data-[size=sm]:px-[2px] dark:aria-invalid:border-destructive/50 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background shadow-sm transition-transform duration-150 ease-(--ease-out) group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-4 data-unchecked:translate-x-0 dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
