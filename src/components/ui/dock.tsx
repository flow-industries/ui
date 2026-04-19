import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { LucideIcon } from "lucide-react"

import { cn } from "../../utils/cn"

type DockVariant = "default" | "secondary" | "primary"

interface DockItem {
  icon?: LucideIcon
  customIcon?: React.ReactNode
  label: string
  onClick?: () => void
  customComponent?: React.ReactNode
  extra?: React.ReactNode
  variant?: DockVariant
  isActive?: boolean
}

interface DockProps extends Omit<React.ComponentProps<"div">, "children"> {
  items: DockItem[]
}

interface DockIconButtonProps extends DockItem {
  className?: string
  onHover?: () => void
  onLeave?: () => void
  ref?: React.Ref<HTMLButtonElement>
}

const variantClasses: Record<DockVariant, string> = {
  default: "hover:bg-secondary/50",
  secondary: "bg-secondary/50 hover:bg-primary hover:text-primary-foreground",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
}

function DockIconButton({
  icon: Icon,
  customIcon,
  onClick,
  className,
  customComponent,
  variant = "default",
  isActive,
  onHover,
  onLeave,
  ref,
}: DockIconButtonProps) {
  if (customComponent) {
    return <div className="w-full">{customComponent}</div>
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      data-slot="dock-item"
      data-active={isActive ? "" : undefined}
      className={cn(
        "relative group flex h-12 w-12 items-center justify-center rounded-2xl p-3 md:h-14 md:w-14",
        "transition-[background-color,color]",
        isActive ? "text-primary" : "text-muted-foreground/60",
        variantClasses[variant],
        className,
      )}
    >
      {customIcon ? (
        <div className="flex h-5 w-5 items-center justify-center md:h-6 md:w-6">{customIcon}</div>
      ) : Icon ? (
        <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} />
      ) : null}
    </motion.button>
  )
}

function Dock({ items, className, ref, ...props }: DockProps) {
  const shouldReduceMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showExtra, setShowExtra] = useState(false)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonRefs = useRef<Array<HTMLDivElement | null>>([])
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)")
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const handleMouseEnter = useCallback(
    (index: number) => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      setPreviousIndex(hoveredIndex)
      setHoveredIndex(index)
      setShowExtra(true)
    },
    [hoveredIndex],
  )

  const clearAll = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowExtra(false)
      setHoveredIndex(null)
      setPreviousIndex(null)
    }, 200)
  }, [])

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  const contentAnimationY =
    previousIndex === null || hoveredIndex === null
      ? 0
      : hoveredIndex > previousIndex
        ? 5
        : -5

  const hoveredItem = hoveredIndex !== null ? items[hoveredIndex] : null
  const hoveredButton = hoveredIndex !== null ? buttonRefs.current[hoveredIndex] : null

  return (
    <div
      ref={ref}
      data-slot="dock"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <motion.div
        layout
        data-slot="dock-list"
        className="relative flex w-full flex-row items-center justify-around gap-2 rounded-2xl p-2 sm:w-auto sm:flex-col sm:justify-center md:gap-3"
      >
        <AnimatePresence mode="popLayout">
          {showExtra && hoveredItem && hoveredButton && (
            <div
              data-slot="dock-popover"
              className={cn("pointer-events-auto absolute z-50", !isDesktop && "-translate-x-1/2")}
              style={
                isDesktop
                  ? {
                      right: "calc(100% + 6px)",
                      top: `${hoveredButton.offsetTop}px`,
                      transform: `translateY(calc(-50% + ${hoveredButton.offsetHeight / 2}px))`,
                    }
                  : {
                      bottom: "calc(100% + 6px)",
                      left: `${hoveredButton.offsetLeft + hoveredButton.offsetWidth / 2}px`,
                    }
              }
            >
              <motion.div
                layoutId="dock-extra"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.05 },
                        scale: { type: "spring", stiffness: 300, damping: 25 },
                        layout: { type: "spring", stiffness: 300, damping: 25 },
                      },
                }}
                exit={{
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.8,
                  transition: { duration: 0.05 },
                }}
                onMouseEnter={cancelHide}
                onMouseLeave={clearAll}
              >
                <motion.div
                  className="overflow-hidden rounded-xl bg-background/80 text-popover-foreground shadow-md ring-[length:var(--border-width)] ring-primary/10 backdrop-blur-lg"
                  key={hoveredIndex}
                  initial={{
                    y: shouldReduceMotion ? 0 : contentAnimationY,
                    opacity: 0,
                    scale: shouldReduceMotion ? 1 : 0.95,
                  }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.1,
                    scale: shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", damping: 25, stiffness: 400 },
                  }}
                >
                  {hoveredItem.extra ?? (
                    <div className="select-none whitespace-nowrap px-3 py-1.5 text-base font-medium text-muted-foreground">
                      {hoveredItem.label}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {items.map((item, index) => (
          <div
            key={item.label}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            className="relative"
          >
            <DockIconButton {...item} onHover={() => handleMouseEnter(index)} onLeave={clearAll} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export { Dock, type DockItem, type DockProps }
