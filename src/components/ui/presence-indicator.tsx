import { Circle, CircleMinus, EyeOff, Moon } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils/cn";

type PresenceStatus = "online" | "idle" | "busy" | "invisible" | "offline";

const presenceAppearance = {
  online: {
    label: "Online",
    icon: Circle,
    className: "fill-success text-foreground",
  },
  idle: {
    label: "Idle",
    icon: Moon,
    className: "fill-dark-orange text-foreground",
  },
  busy: {
    label: "Busy",
    icon: CircleMinus,
    className: "fill-destructive text-background",
  },
  invisible: {
    label: "Invisible",
    icon: EyeOff,
    className: "text-muted-foreground",
  },
  offline: {
    label: "Offline",
    icon: Circle,
    className: "text-muted-foreground",
  },
} satisfies Record<
  PresenceStatus,
  { label: string; icon: typeof Circle; className: string }
>;

/**
 * Availability supplied by the caller, with no fetching or lifecycle state.
 * Missing status renders nothing; Invisible is shown only for an explicit self
 * view. Use aria-hidden when adjacent text already names the status.
 */
function PresenceIndicator({
  status,
  self = false,
  size = "default",
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  status?: PresenceStatus | null;
  self?: boolean;
  size?: "sm" | "default";
}) {
  if (!status) return null;
  const visibleStatus = status === "invisible" && !self ? "offline" : status;
  const appearance = presenceAppearance[visibleStatus];
  if (!appearance) return null;
  const Icon = appearance.icon;

  return (
    <span
      data-slot="presence-indicator"
      data-status={visibleStatus}
      role="img"
      aria-label={appearance.label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-background [corner-shape:round]",
        size === "sm" ? "size-3.5" : "size-4",
        className,
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-full", appearance.className)}
      />
    </span>
  );
}

const ringClassName = {
  online: "border-success-foreground",
  idle: "border-muted-foreground",
  busy: "border-destructive",
  invisible: "border-dashed border-muted-foreground",
  offline: "border-transparent",
} satisfies Record<PresenceStatus, string>;

function awayLabel(minutes: number) {
  if (minutes < 60) {
    const m = Math.max(1, Math.round(minutes));
    return `Idle for ${m} ${m === 1 ? "minute" : "minutes"}`;
  }
  const h = Math.floor(minutes / 60);
  return `Idle for ${h} ${h === 1 ? "hour" : "hours"}`;
}

/** Degrees the idle ring stays open, clockwise from 12 o'clock: wider the longer someone is away. */
function awayGap(minutes: number | undefined) {
  if (minutes === undefined) return 90;
  return Math.min(306, Math.max(30, 30 + minutes * 4.6));
}

/**
 * Availability as a ring around an avatar: 2px wide, 2px out, concentric with
 * the avatar's corners. Place it inside `Avatar`. Online is a full ring, idle a
 * grey ring left open clockwise by time away, busy a ring cut by a minus bar,
 * invisible (only in your own view) dashed; offline draws no ring and greys the
 * photo. Every state is named for assistive technology. Missing status renders
 * nothing.
 *
 * @param away  Minutes idle: opens the idle ring further and names it ("Idle for 12 minutes").
 * @param label Overrides the accessible name, e.g. "Busy until 15:00".
 */
function PresenceRing({
  status,
  self = false,
  away,
  label,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  status?: PresenceStatus | null;
  self?: boolean;
  away?: number;
  label?: string;
}) {
  if (!status) return null;
  const visibleStatus = status === "invisible" && !self ? "offline" : status;
  const name =
    label ??
    (visibleStatus === "idle" && away !== undefined
      ? awayLabel(away)
      : presenceAppearance[visibleStatus].label);
  const gap = visibleStatus === "idle" ? awayGap(away) : null;

  return (
    <span
      data-slot="presence-ring"
      data-status={visibleStatus}
      role="img"
      aria-label={name}
      className={cn(
        // The ring is 8px wider than the avatar, so this keeps its radius at the
        // avatar's plus 4px: 50% stays 50%, the 35% fallback becomes 38.75%.
        "pointer-events-none absolute -inset-1 z-10 rounded-[calc(50%-(50%-var(--squircle-radius))*0.75)] border-2",
        ringClassName[visibleStatus],
        className,
      )}
      style={
        gap === null
          ? style
          : {
              maskImage: `conic-gradient(transparent 0deg ${gap}deg, #000 ${gap}deg)`,
              ...style,
            }
      }
      {...props}
    >
      {visibleStatus === "busy" ? (
        <span className="absolute -bottom-[3.5px] left-1/2 h-[5px] w-3 -translate-x-1/2 rounded-full bg-destructive shadow-[0_0_0_1.5px_var(--background)]" />
      ) : null}
    </span>
  );
}

export { PresenceIndicator, PresenceRing, type PresenceStatus };
