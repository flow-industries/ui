"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { motion, AnimatePresence } from "motion/react"
import * as React from "react"

import { cn } from "../../utils/cn"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [checked, setChecked] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new MutationObserver(() => {
      setChecked(el.getAttribute("data-checked") !== null)
    })
    setChecked(el.getAttribute("data-checked") !== null)
    observer.observe(el, { attributes: true, attributeFilter: ["data-checked"] })
    return () => observer.disconnect()
  }, [])

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[length:var(--border-width)] border-transparent bg-input transition-colors duration-150 ease-(--ease-out) outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 data-checked:bg-input data-checked:border-transparent",
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {checked && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="grid place-content-center text-primary [&>svg]:size-4"
          >
            <CheckIcon strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
