"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "../../utils/cn"

const AccordionItemContext = React.createContext(false)

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  onOpenChange,
  ...props
}: AccordionPrimitive.Item.Props) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new MutationObserver(() => {
      setOpen(el.hasAttribute("data-open"))
    })
    setOpen(el.hasAttribute("data-open"))
    observer.observe(el, { attributes: true, attributeFilter: ["data-open"] })
    return () => observer.disconnect()
  }, [])

  return (
    <AccordionItemContext.Provider value={open}>
      <AccordionPrimitive.Item
        ref={ref}
        data-slot="accordion-item"
        className={cn("not-last:border-b-[length:var(--border-width)] py-2", className)}
        onOpenChange={onOpenChange}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
}

function AccordionIcon({ open }: { open: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted-foreground"
      data-slot="accordion-trigger-icon"
    >
      <motion.path
        d="M5 12h14"
        animate={{
          rotate: open ? 90 : 0,
          opacity: open ? 0 : 1,
        }}
        style={{ transformOrigin: "center" }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
      />
      <motion.path
        d="M12 5v14"
        animate={{
          rotate: open ? 90 : 0,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  const open = React.useContext(AccordionItemContext)

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border-[length:var(--border-width)] border-transparent py-2.5 text-left text-sm font-medium tracking-tighter transition-[color,background-color,border-color] outline-none focus-visible:border-[length:var(--border-width-focus)] focus-visible:border-focus aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <AccordionIcon open={open} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const open = React.useContext(AccordionItemContext)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      data-slot="accordion-content"
      role="region"
      initial={false}
      animate={{
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="overflow-hidden text-sm"
    >
      <div
        className={cn(
          "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
