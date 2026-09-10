"use client";

import React, { useEffect, useRef, useState } from "react";

interface ColoredPointerProps {
  /** Fill color of the pointer SVG */
  color?: string;
  /** Stroke/border color of the pointer SVG */
  strokeColor?: string;
  /** Size of the pointer in pixels */
  size?: number;
}

/**
 * Colored Pointer — Custom cursor with smooth tracking.
 * Inspired by Magic UI's Pointer component.
 * Hides the native cursor and replaces it with a colored SVG pointer.
 */
export function ColoredPointer({
  color = "#d8ff7c",
  strokeColor = "#000000",
  size = 22,
}: ColoredPointerProps) {
  const pointerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isCoarseRef = useRef(false);

  useEffect(() => {
    // Don't show custom pointer on touch devices
    isCoarseRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (isCoarseRef.current) return;

    const handleMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleEnter = () => {
      setIsVisible(true);
    };

    const handleLeave = () => {
      setIsVisible(false);
    };

    // Animation loop with smooth lerp
    const animate = () => {
      const lerp = 0.18;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Hide native cursor globally
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    // Add a style tag for all interactive elements
    const styleEl = document.createElement("style");
    styleEl.id = "colored-pointer-style";
    styleEl.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerenter", handleEnter);
    document.addEventListener("pointerleave", handleLeave);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      // Restore native cursor
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
      const style = document.getElementById("colored-pointer-style");
      if (style) style.remove();

      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerenter", handleEnter);
      document.removeEventListener("pointerleave", handleLeave);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible]);

  // Don't render on touch/coarse-pointer devices
  if (typeof window !== "undefined" && isCoarseRef.current) return null;

  return (
    <div
      ref={pointerRef}
      className="fixed top-0 left-0 pointer-events-none select-none"
      style={{
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 150ms ease-out",
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      {/* SVG Cursor Pointer — Arrow shape with fill + stroke */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
        }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke={strokeColor}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
