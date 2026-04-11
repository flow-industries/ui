import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "div",
  duration = 1,
  clockwise = true,
  inverted = false,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
    inverted?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Gradient colors based on theme
  const gradientColor = inverted
    ? "oklch(0.95 0 0)"
    : "oklch(0.25 0 0)";
  const gradientColorFade = inverted
    ? "oklch(0.95 0 0 / 0)"
    : "oklch(0.25 0 0 / 0)";

  const movingMap: Record<Direction, string> = {
    TOP: `radial-gradient(30% 60% at 50% 0%, ${gradientColor} 0%, ${gradientColorFade} 100%)`,
    LEFT: `radial-gradient(25% 50% at 0% 50%, ${gradientColor} 0%, ${gradientColorFade} 100%)`,
    BOTTOM: `radial-gradient(30% 60% at 50% 100%, ${gradientColor} 0%, ${gradientColorFade} 100%)`,
    RIGHT: `radial-gradient(25% 50% at 100% 50%, ${gradientColor} 0%, ${gradientColorFade} 100%)`,
  };

  const highlight = "radial-gradient(75% 150% at 50% 50%, oklch(0.7 0.15 350) 0%, oklch(0.7 0.15 350 / 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex content-center transition duration-500 items-center flex-col flex-nowrap justify-center overflow-hidden p-px",
        inverted ? "bg-secondary/50 hover:bg-secondary/30" : "bg-muted/50 hover:bg-muted/30",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full h-full z-10 rounded-[inherit]",
          inverted ? "bg-secondary text-secondary-foreground" : "bg-card text-card-foreground",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(3px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div
        className={cn(
          "absolute z-[1] flex-none inset-[1px] rounded-[inherit]",
          inverted ? "bg-secondary" : "bg-card"
        )}
      />
    </Tag>
  );
}
