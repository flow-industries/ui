"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { motion } from "motion/react"

import { cn } from "../../utils/cn"

function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const [isChecked, setIsChecked] = React.useState(defaultChecked ?? false)
  const controlled = checked !== undefined
  const on = controlled ? checked : isChecked

  const handleChange = React.useCallback((val: boolean) => {
    if (!controlled) setIsChecked(val)
    onCheckedChange?.(val)
  }, [controlled, onCheckedChange])

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={on}
      onCheckedChange={handleChange}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:border-[length:var(--border-width-focus)] dark:data-[state=unchecked]:bg-input/80 inline-flex h-6 w-11 shrink-0 items-center rounded-full border-[length:var(--border-width)] border-transparent px-0.5 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        asChild
      >
        <motion.span
          className="pointer-events-none block size-[18px] rounded-full bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground"
          animate={{ x: on ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
