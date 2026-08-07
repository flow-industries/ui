import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const profilePillVariants = cva(
  "group/profile-pill inline-flex w-fit items-center rounded-full text-foreground outline-none transition-colors [&:is(a,button):hover]:text-muted-foreground",
  {
    variants: {
      size: {
        sm: "gap-2 p-0.5 pl-3 font-medium text-sm",
        default: "gap-2.5 p-0.5 pl-3.5 font-medium text-base",
        lg: "gap-3 p-1 pl-4 font-semibold text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/**
 * The signed-in user's identity chip — username followed by their avatar — used
 * wherever an app shows who is signed in (Flow ID's own pill, the game menu, and
 * every app header). Rendering only: it holds no session state and fetches
 * nothing, so callers pass whatever identity they already have.
 *
 * Renders a `button` by default, which is also what makes it a drop-in trigger:
 *
 * ```tsx
 * <DropdownMenuTrigger render={<ProfilePill username={user.username} />} />
 * ```
 *
 * Pass `render={<span />}` for a non-interactive display; the hover treatment
 * only applies while it is a button or a link.
 *
 * @param username Shown as-is, truncated past 12rem — callers guard the
 *                 signed-out case rather than passing an empty string.
 * @param image    Avatar URL; falls back to the anonymous silhouette when it is
 *                 absent or fails to load.
 */
function ProfilePill({
  username,
  image,
  size = "default",
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> &
  VariantProps<typeof profilePillVariants> & {
    username: string;
    image?: string | null;
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        // Only when we own the element: `type` on a caller-supplied `render`
        // element would be an invalid attribute (and the base layer turns any
        // [type=button] into a pointer cursor, even on a span).
        ...(render ? {} : { type: "button" as const }),
        className: cn(profilePillVariants({ size, className })),
      },
      props,
      {
        children: (
          <>
            <span className="max-w-[12rem] truncate">{username}</span>
            <Avatar size={size ?? "default"}>
              {image ? <AvatarImage src={image} alt="" /> : null}
              <AvatarFallback />
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
