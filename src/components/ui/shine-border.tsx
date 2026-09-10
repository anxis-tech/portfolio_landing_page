"use client";

import * as React from "react";

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 * From Magic UI (https://magicui.design/docs/components/shine-border)
 */
export function ShineBorder({
  borderWidth = 1.5,
  duration = 8,
  shineColor = ["#d8ff7c", "#ffffff", "#a3e635"],
  className = "",
  style,
  ...props
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          animation: `shine ${duration}s infinite linear`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] z-20 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
