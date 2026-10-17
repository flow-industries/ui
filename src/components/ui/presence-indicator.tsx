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

export { PresenceIndicator, type PresenceStatus };
