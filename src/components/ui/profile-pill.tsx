import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { PresenceRing, type PresenceStatus } from "./presence-indicator";

const profilePillVariants = cva(
  // Bare: no fill or outline until focus, when a border shows 2px outside the
  // presence ring. `flow-profile-pill` lets the top row pull that 4px past its
  // inset, so the ring's outer edge, not the focus border, sits on the inset.
  // normal-case/tracking-tight are load-bearing: app headers commonly set
  // `uppercase tracking-widest` on the nav around it and both inherit, so the
  // pill restates the base layer's own defaults rather than accepting them.
  "flow-profile-pill group/profile-pill inline-flex w-fit max-w-full items-center rounded-full border-[length:var(--border-width)] border-transparent py-0.5 pr-0.5 pl-2 text-foreground normal-case tracking-tight outline-none transition-[color,border-color] duration-150 ease-(--ease-out) focus-visible:border-focus [&:is(a,button)]:pointer-coarse:min-h-11 [&:is(a,button):hover]:text-muted-foreground",
  {
    variants: {
      size: {
        sm: "gap-1.5 font-medium text-sm",
        md: "gap-1.5 font-medium text-base",
        lg: "gap-2 font-semibold text-lg",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const avatarSize = { sm: "sm", md: "default", lg: "lg" } as const;

/**
 * The signed-in user's identity — username, then their avatar with its presence
 * ring — used wherever an app shows who is signed in: the top row's end slot,
 * Flow ID's own pill, the game menu. Small (a 24px avatar) by default, which is
 * the header size. Rendering only: it holds no session state and fetches
 * nothing, so callers pass whatever identity they already have.
 *
 * Renders a `button` by default, which is also what makes it a drop-in trigger:
 *
 * ```tsx
 * <DropdownMenuTrigger render={<ProfilePill username={user.username} />} />
 * ```
 *
 * Pass `render={<span />}` for a non-interactive display; the hover, focus and
 * touch-floor treatment only apply while it is a button or a link. The avatar
 * always keeps the ring's 4px of room, so the pill doesn't move when presence
 * loads. The name truncates when space runs short; in a `FloatingHeader` end
 * slot too narrow for a few characters it is hidden visually (still named for
 * assistive technology), leaving the avatar and its ring.
 *
 * @param username    Shown as-is, truncated past 12rem — callers guard the
 *                    signed-out case rather than passing an empty string.
 * @param image       Avatar URL; falls back to the anonymous silhouette when it
 *                    is absent or fails to load.
 * @param status      Presence, drawn as a ring; none leaves the avatar unmarked.
 * @param self        The viewer's own pill: Invisible shows dashed rather than
 *                    as Offline.
 * @param away        Minutes idle: opens the idle ring and names it.
 * @param statusLabel Overrides the ring's accessible name ("Busy until 15:00").
 */
function ProfilePill({
  username,
  image,
  status,
  self,
  away,
  statusLabel,
  size = "sm",
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> &
  VariantProps<typeof profilePillVariants> & {
    username: string;
    image?: string | null;
    status?: PresenceStatus | null;
    self?: boolean;
    away?: number;
    statusLabel?: string;
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        // Only when we own the element: `type` on a caller-supplied `render`
        // element would be an invalid attribute (and the base layer turns any
        // [type=button] into a pointer cursor, even on a span).
        type: render ? undefined : ("button" as const),
        className: cn(profilePillVariants({ size, className })),
      },
      props,
      {
        children: (
          <>
            <span
              data-slot="profile-pill-name"
              className="max-w-[12rem] min-w-0 truncate"
            >
              {username}
            </span>
            <Avatar size={avatarSize[size ?? "sm"]} className="m-1">
              {image ? <AvatarImage src={image} alt="" /> : null}
              <AvatarFallback />
              <PresenceRing
                status={status}
                self={self}
                away={away}
                label={statusLabel}
              />
            </Avatar>
          </>
        ),
      },
    ),
    render,
    state: {
      slot: "profile-pill",
      size,
    },
  });
}

export { ProfilePill, profilePillVariants };
