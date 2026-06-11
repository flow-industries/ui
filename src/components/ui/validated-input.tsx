import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";

import { cn } from "../../utils/cn";
import { Input } from "./input";

export type ValidationStatus = "idle" | "checking" | "valid" | "invalid";

const statusIconAnimation = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(2px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(2px)" },
  transition: { type: "spring" as const, duration: 0.25, bounce: 0.2 },
};

function ValidatedInput({
  status = "idle",
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<typeof Input> & { status?: ValidationStatus }) {
  return (
    <div className="relative group/validated-input">
      <Input
        data-slot="validated-input"
        aria-invalid={ariaInvalid ?? status === "invalid"}
        className={cn("pr-12", className)}
        {...props}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none">
        <AnimatePresence initial={false}>
          {status === "checking" && (
            <motion.div
              key="checking"
              className="absolute inset-0"
              {...statusIconAnimation}
            >
              <Loader2 className="size-4 animate-spin text-muted-foreground stroke-[3]" />
            </motion.div>
          )}
          {status === "valid" && (
            <motion.div
              key="valid"
              className="absolute inset-0"
              {...statusIconAnimation}
            >
              <Check className="size-4 text-primary group-focus-within/validated-input:text-brand stroke-[3] transition-colors" />
            </motion.div>
          )}
          {status === "invalid" && (
            <motion.div
              key="invalid"
              className="absolute inset-0"
              {...statusIconAnimation}
            >
              <X className="size-4 text-destructive stroke-[3]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { ValidatedInput };
