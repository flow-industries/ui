import * as React from "react"
import { useEffect, useState } from "react"
import { format } from "date-fns"

function toDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input)
}

function getTimeAgo(date: Date): string {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSeconds < 60) return "just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInDays < 7) return `${diffInDays}d`
  if (diffInWeeks < 3) return `${diffInWeeks}w`
  if (diffInMonths < 12) return `${diffInMonths}mo`
  return `${diffInYears}y`
}

interface TimeElapsedProps extends React.ComponentProps<"span"> {
  date: Date | string | number
  longFormat?: string
}

function TimeElapsed({ date, longFormat = "MMM d", className, ref, ...props }: TimeElapsedProps) {
  const dateObj = toDate(date)
  const [label, setLabel] = useState(() => getTimeAgo(dateObj))

  useEffect(() => {
    const update = () => setLabel(getTimeAgo(dateObj))

    window.addEventListener("focus", update)

    const diffInHours = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60)
    let interval: ReturnType<typeof setInterval> | undefined
    if (diffInHours <= 1) {
      interval = setInterval(update, 60_000)
    }

    return () => {
      window.removeEventListener("focus", update)
      if (interval) clearInterval(interval)
    }
  }, [dateObj])

  const diffInWeeks = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24 * 7)
  const display = diffInWeeks > 3 ? format(dateObj, longFormat) : label

  return (
    <span ref={ref} data-slot="time-elapsed" className={className} {...props}>
      {display}
    </span>
  )
}

interface TimeSinceProps extends React.ComponentProps<"span"> {
  date: Date | string | number
  format?: string
}

function TimeSince({ date, format: fmt = "MMM yyyy", className, ref, ...props }: TimeSinceProps) {
  return (
    <span ref={ref} data-slot="time-since" className={className} {...props}>
      {format(toDate(date), fmt)}
    </span>
  )
}

export { TimeElapsed, TimeSince, type TimeElapsedProps, type TimeSinceProps }
