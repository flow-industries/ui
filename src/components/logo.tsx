import { motion, useReducedMotion } from "motion/react"
import { cn } from "../utils/cn"

interface LogoProps {
  className?: string
  size?: number
  color?: string
}

export function Logo({ className, size = 28, color }: LogoProps) {
  return (
    <div
      className={cn("bg-pink rounded-sm", className)}
      style={{ width: size, height: size, ...(color ? { backgroundColor: color } : {}) }}
    />
  )
}

export function LogoSpinner({ className, size = 64 }: LogoProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn("bg-pink rounded-sm", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: shouldReduceMotion ? 0 : 90 }}
      transition={{ type: "spring", stiffness: 150, damping: 14, repeat: Infinity, repeatDelay: 0.05 }}
    />
  )
}

type Size = "sm" | "default" | "lg" | "xl" | "2xl" | "3xl"

const wordmarkSizes = {
  sm: "text-xs tracking-widest gap-0.5",
  default: "text-sm tracking-widest gap-0.5",
  lg: "text-lg tracking-widest gap-0.5",
  xl: "text-2xl tracking-widest gap-0.5",
  "2xl": "text-4xl tracking-widest gap-0.5",
  "3xl": "text-6xl tracking-widest gap-0.5",
} as const

export function Wordmark({
  start,
  end,
  size = "default",
  className,
}: {
  start: string
  end: string
  size?: Size
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-baseline uppercase", wordmarkSizes[size], className)}>
      <span className="font-extralight">{start}</span>
      <span className="font-semibold">{end}</span>
    </span>
  )
}

const logomarkSizes = {
  sm: { logo: 14, wordmark: "sm" as const, gap: "gap-1.5" },
  default: { logo: 20, wordmark: "default" as const, gap: "gap-2" },
  lg: { logo: 28, wordmark: "lg" as const, gap: "gap-2.5" },
  xl: { logo: 36, wordmark: "xl" as const, gap: "gap-3" },
  "2xl": { logo: 48, wordmark: "2xl" as const, gap: "gap-3.5" },
  "3xl": { logo: 64, wordmark: "3xl" as const, gap: "gap-4" },
} as const

export function Logomark({
  start = "Flow",
  end = "Game",
  size = "default",
  className,
  color,
}: {
  start?: string
  end?: string
  size?: Size
  className?: string
  color?: string
}) {
  const s = logomarkSizes[size]
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <Logo size={s.logo} color={color} />
      <Wordmark start={start} end={end} size={s.wordmark} />
    </span>
  )
}
