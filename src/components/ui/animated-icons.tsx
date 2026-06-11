"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../../utils/cn";

function CopyCheckIcon({
  copied,
  className,
  size = 14,
}: {
  copied: boolean;
  className?: string;
  size?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const noMotion = !!shouldReduceMotion;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: noMotion ? 1 : 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: noMotion ? 1 : 0.5, opacity: 0 }}
            transition={
              noMotion
                ? { duration: 0 }
                : { type: "spring", duration: 0.3, bounce: 0.2 }
            }
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check
              style={{ width: size, height: size }}
              className="text-foreground stroke-[2.5]"
            />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: noMotion ? 1 : 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: noMotion ? 1 : 0.5, opacity: 0 }}
            transition={
              noMotion
                ? { duration: 0 }
                : { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }
            }
            className="absolute inset-0 flex items-center justify-center"
          >
            <Copy
              style={{ width: size, height: size }}
              className="text-muted-foreground stroke-[2.5]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyButton({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <button
      type="button"
      data-slot="copy-button"
      onClick={copy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-mono transition-[color,background-color] duration-100 ease-(--ease-out)",
        copied ? "bg-muted" : "bg-secondary hover:bg-muted",
        className,
      )}
    >
      <span className="flex-1 text-left">{children}</span>
      <CopyCheckIcon
        copied={copied}
        className={cn(
          "transition-opacity duration-100",
          !copied && !hovered && "opacity-0",
        )}
        size={12}
      />
    </button>
  );
}

export { CopyButton, CopyCheckIcon };
