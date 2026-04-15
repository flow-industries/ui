import { cn } from "../../utils/cn"

const titleStyles = {
  sm: "text-sm font-medium",
  default: "text-base font-medium tracking-tighter",
  lg: "text-3xl font-semibold tracking-tighter",
} as const

const titleTags = { sm: "h3", default: "h2", lg: "h1" } as const

function Title({ className, size = "default", ...props }: React.ComponentProps<"h1"> & { size?: "sm" | "default" | "lg" }) {
  const Tag = titleTags[size]
  return (
    <Tag
      data-slot="title"
      className={cn(titleStyles[size], className)}
      {...props}
    />
  )
}

const subtitleStyles = {
  sm: "text-xs text-muted-foreground",
  default: "text-sm text-muted-foreground",
  lg: "text-lg text-muted-foreground",
} as const

function Subtitle({ className, size = "default", ...props }: React.ComponentProps<"p"> & { size?: "sm" | "default" | "lg" }) {
  return (
    <p
      data-slot="subtitle"
      className={cn(subtitleStyles[size], className)}
      {...props}
    />
  )
}

function Overline({ className, variant = "default", ...props }: React.ComponentProps<"span"> & { variant?: "default" | "brand" }) {
  return (
    <span
      data-slot="overline"
      className={cn(
        "text-sm font-[550] tracking-wide",
        variant === "brand" ? "text-brand" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function Caption({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="caption"
      className={cn("text-xs font-[450] tracking-wide text-foreground", className)}
      {...props}
    />
  )
}

function Mono({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="mono"
      className={cn("text-sm font-mono tracking-normal text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Title, Subtitle, Overline, Caption, Mono }
