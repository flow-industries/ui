"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"

import { cn } from "../../utils/cn"

type DrawerSide = "top" | "bottom" | "left" | "right"
const DrawerContext = React.createContext<DrawerSide>("bottom")
const sideToSwipe = { bottom: "down", top: "up", left: "left", right: "right" } as const

function Drawer({
  side = "bottom",
  ...props
}: Omit<DrawerPrimitive.Root.Props, "swipeDirection"> & {
  side?: DrawerSide
}) {
  return (
    <DrawerContext.Provider value={side}>
      <DrawerPrimitive.Root data-slot="drawer" swipeDirection={sideToSwipe[side]} {...props} />
    </DrawerContext.Provider>
  )
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay transition-opacity duration-300 ease-(--ease-out-expo) supports-backdrop-filter:backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:transition-none",
        className
      )}
      style={{ opacity: `calc(1 * (1 - var(--drawer-swipe-progress, 0)))` }}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const side = React.useContext(DrawerContext)

  const positionClasses = {
    bottom: "inset-x-0 bottom-0 max-h-[80vh] rounded-t-xl border-t-[length:var(--border-width)] [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]",
    top: "inset-x-0 top-0 max-h-[80vh] rounded-b-xl border-b-[length:var(--border-width)] [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(-100%)] data-starting-style:[transform:translateY(-100%)]",
    left: "inset-y-0 left-0 w-3/4 sm:max-w-sm rounded-r-xl border-r-[length:var(--border-width)] [transform:translateX(var(--drawer-swipe-movement-x,0px))] data-ending-style:[transform:translateX(-100%)] data-starting-style:[transform:translateX(-100%)]",
    right: "inset-y-0 right-0 w-3/4 sm:max-w-sm rounded-l-xl border-l-[length:var(--border-width)] [transform:translateX(var(--drawer-swipe-movement-x,0px))] data-ending-style:[transform:translateX(100%)] data-starting-style:[transform:translateX(100%)]",
  }

  return (
    <DrawerPrimitive.Portal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content fixed z-50 flex flex-col bg-background text-sm text-foreground shadow-lg outline-none transition-transform duration-300 ease-(--ease-out-expo) data-swiping:transition-none data-ending-style:duration-[calc(var(--drawer-swipe-strength,0.5)*400ms)]",
            positionClasses[side],
            className
          )}
          {...props}
        >
          {side === "bottom" && (
            <div className="mx-auto mt-4 h-1 w-[100px] shrink-0 rounded-full bg-muted" />
          )}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-base font-medium tracking-tighter text-foreground", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
