import { cn } from "../../utils/cn"

const sizes = {
  sm: { swatch: "w-8 h-8", fg: "w-4 h-4", rounded: "rounded-md", roundedInner: "rounded-[2px]", gap: "gap-px" },
  default: { swatch: "w-12 h-12", fg: "w-6 h-6", rounded: "rounded-lg", roundedInner: "rounded-xs", gap: "gap-0.5" },
  lg: { swatch: "w-16 h-16", fg: "w-8 h-8", rounded: "rounded-xl", roundedInner: "rounded-sm", gap: "gap-0.5" },
} as const

type Size = "sm" | "default" | "lg"

function ColorSwatch({
  color,
  className,
  size = "default",
  border,
  ...props
}: React.ComponentProps<"div"> & {
  color: string
  size?: Size
  border?: boolean
}) {
  const s = sizes[size]
  return (
    <div
      data-slot="color-swatch"
      className={cn(s.swatch, s.rounded, color, border && "border border-secondary", className)}
      {...props}
    />
  )
}

function HueGroup({
  dark,
  standard,
  light,
  size = "default",
  className,
}: {
  dark: string
  standard: string
  light: string
  size?: Size
  className?: string
}) {
  const s = sizes[size]
  const roundedL = `${s.rounded.replace("rounded", "rounded-l")} ${s.roundedInner.replace("rounded", "rounded-r")}`
  const roundedR = `${s.rounded.replace("rounded", "rounded-r")} ${s.roundedInner.replace("rounded", "rounded-l")}`

  return (
    <div data-slot="hue-group" className={cn("flex", s.gap, className)}>
      <div className={cn(s.swatch, roundedL, dark)} />
      <div className={cn(s.swatch, s.roundedInner, standard)} />
      <div className={cn(s.swatch, roundedR, light)} />
    </div>
  )
}

export { ColorSwatch, HueGroup }
