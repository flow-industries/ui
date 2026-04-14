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
