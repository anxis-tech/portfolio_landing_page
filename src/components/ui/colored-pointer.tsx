"use client";

import { useEffect } from "react";

interface ColoredPointerProps {
  color?: string;
  strokeColor?: string;
  size?: number;
}

// Let the browser draw the same custom arrow at the actual mouse position.
// A native cursor needs no interpolation, pointermove handler or animation loop.
export function ColoredPointer({
  color = "#d8ff7c",
  strokeColor = "#000000",
  size = 22,
}: ColoredPointerProps) {
  useEffect(() => {
    const root = document.documentElement;
    const enabled = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const previousCursor = root.style.getPropertyValue("--portfolio-cursor");
    const previousPriority = root.style.getPropertyPriority("--portfolio-cursor");
    const previouslyActive = root.classList.contains("custom-pointer-active");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill="${color}" stroke="${strokeColor}" stroke-width="1"/></svg>`;
    const cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 1 1, auto`;

    const restore = () => {
      if (previousCursor) root.style.setProperty("--portfolio-cursor", previousCursor, previousPriority);
      else root.style.removeProperty("--portfolio-cursor");
      root.classList.toggle("custom-pointer-active", previouslyActive);
    };
    const update = () => {
      if (!enabled.matches) {
        restore();
        return;
      }
      root.style.setProperty("--portfolio-cursor", cursor);
      root.classList.add("custom-pointer-active");
    };
    update();
    enabled.addEventListener("change", update);
    return () => {
      enabled.removeEventListener("change", update);
      restore();
    };
  }, [color, strokeColor, size]);

  return null;
}
