import * as React from "react"

import { cn } from "../../utils/cn"

function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="footer"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  )
}

function FooterContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-content"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  )
}

function FooterBottom({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn("flex items-center justify-between gap-4 pt-6 border-t-[length:var(--border-width)] border-secondary", className)}
      {...props}
    />
  )
}

function FooterBrand({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-brand"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function FooterSocials({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-socials"
      className={cn("flex items-center gap-4 text-muted-foreground", className)}
      {...props}
    />
  )
}

function FooterLink({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="footer-link"
      className={cn("[transition:color_80ms_ease] hover:text-foreground", className)}
      {...props}
    />
  )
}

function FooterCopyright({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="footer-copyright"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Footer, FooterContent, FooterBottom, FooterBrand, FooterSocials, FooterLink, FooterCopyright }
