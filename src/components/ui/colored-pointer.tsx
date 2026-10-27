"use client";

import React, { useEffect, useRef } from "react";

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
  useEffect(() => {
    const pointer = pointerRef.current;
    const enabled = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!pointer) return;
    const stop = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      pointer.style.opacity = "0";
      document.documentElement.classList.remove("custom-pointer-active");
    };
    const animate = () => {
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;
      posRef.current.x += dx * 0.18;
      posRef.current.y += dy * 0.18;
      pointer.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      rafRef.current = Math.abs(dx) + Math.abs(dy) > 0.1 ? requestAnimationFrame(animate) : null;
    };
    const handleMove = (event: PointerEvent) => {
      if (!enabled.matches || document.hidden || event.pointerType === "touch") return;
      targetRef.current = { x: event.clientX, y: event.clientY };
      if (pointer.style.opacity !== "1") posRef.current = { ...targetRef.current };
      pointer.style.opacity = "1";
      document.documentElement.classList.add("custom-pointer-active");
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerleave", stop);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    enabled.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", stop);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
      enabled.removeEventListener("change", stop);
    };
  }, []);

  return (
    <div
      ref={pointerRef}
      className="fixed top-0 left-0 pointer-events-none select-none"
      style={{
        zIndex: 99999,
        opacity: 0,
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
