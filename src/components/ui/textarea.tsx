import * as React from "react"

import { cn } from "../../utils/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border-[length:var(--border-width)] border-transparent bg-input px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
