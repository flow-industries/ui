"use client"

import * as React from "react"
import { Toast } from "@base-ui/react/toast"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, XIcon } from "lucide-react"

const toastManager = Toast.createToastManager()

type ToastData = {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} timeout={5000} limit={5}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed bottom-8 right-8 z-[100] w-[360px]">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager<ToastData>()

  return toasts.map((t) => {
    const variant = t.data?.variant ?? "default"
    const icon = {
      success: <CircleCheckIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4 text-orange" />,
      info: <InfoIcon className="size-4 text-blue" />,
      default: null,
    }[variant]

    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className="group pointer-events-auto absolute bottom-0 right-0 w-full select-none rounded-lg bg-background p-4 shadow-lg ring-1 ring-primary/10 [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y,0px))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] z-[calc(1000-var(--toast-index))] h-[var(--height)] origin-bottom transition-[transform,opacity,height] duration-500 ease-(--ease-out-expo) [transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] data-expanded:h-[var(--toast-height)] data-expanded:[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--offset-y))] data-starting-style:[transform:translateY(150%)] data-ending-style:opacity-0 data-ending-style:scale-95"
      >
        <Toast.Content className="flex items-start gap-3 overflow-hidden transition-opacity duration-200 data-behind:pointer-events-none data-behind:opacity-0 data-expanded:pointer-events-auto data-expanded:opacity-100">
          {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
          <div className="flex-1 space-y-1">
            {t.data?.title && <Toast.Title className="text-sm font-medium tracking-tighter">{t.data.title}</Toast.Title>}
            {t.data?.description && <Toast.Description className="text-sm text-muted-foreground">{t.data.description}</Toast.Description>}
          </div>
          <Toast.Close className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100">
            <XIcon className="size-3.5" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}

function toast(titleOrDescription: string, opts?: { description?: string }) {
  if (opts?.description) {
    toastManager.add({ data: { title: titleOrDescription, description: opts.description, variant: "default" } })
  } else {
    toastManager.add({ data: { description: titleOrDescription, variant: "default" } })
  }
}

toast.success = (description: string) => {
  toastManager.add({ data: { description, variant: "success" } })
}

toast.error = (description: string) => {
  toastManager.add({ data: { description, variant: "error" } })
}

toast.warning = (description: string) => {
  toastManager.add({ data: { description, variant: "warning" } })
}

toast.info = (description: string) => {
  toastManager.add({ data: { description, variant: "info" } })
}

export { ToastProvider, toast }
