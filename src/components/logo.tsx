interface LogoProps {
  className?: string
  size?: number
  color?: string
}

export function Logo({ className, size = 28, color }: LogoProps) {
  return (
    <div
      className={`${color ? "" : "bg-pink"} rounded-sm ${className ?? ""}`}
      style={{ width: size, height: size, ...(color ? { backgroundColor: color } : {}) }}
    />
  )
}
