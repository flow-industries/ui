import * as React from "react"

import { cn } from "../../utils/cn"
import { Overline } from "./typography"

function NavList({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="nav-list"
      className={cn("flex flex-wrap gap-12", className)}
      {...props}
    />
  )
}

function NavListGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="nav-list-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function NavListHeader({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <Overline
      data-slot="nav-list-header"
      variant="brand"
      className={className}
      {...props}
    />
  )
}

function NavListItem({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="nav-list-item"
      className={cn("inline-flex items-center gap-2 text-xs font-[450] tracking-wide text-foreground [transition:color_80ms_ease] hover:text-brand", className)}
      {...props}
    />
  )
}

export { NavList, NavListGroup, NavListHeader, NavListItem }
