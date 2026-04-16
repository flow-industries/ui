import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../../utils/cn"

const inputSizes = {
  default: "h-10",
  lg: "min-h-12 py-2.5",
} as const

function Input({ className, type, inputSize = "default", ...props }: React.ComponentProps<"input"> & { inputSize?: "default" | "lg" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border-[length:var(--border-width)] border-transparent bg-input px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:aria-invalid:border-destructive/50",
        inputSizes[inputSize],
        className
      )}
      {...props}
    />
  )
}

export { Input }
