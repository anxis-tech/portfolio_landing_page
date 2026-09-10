"use client";

import React, { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  duration = 1500,
  className = "",
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const [currentValue, setCurrentValue] = useState(direction === "down" ? value : 0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          setTimeout(() => {
            let startTimestamp: number | null = null;
            const startVal = direction === "down" ? value : 0;
            const endVal = direction === "down" ? 0 : value;

            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              
              // Easing function: easeOutExpo
              const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = Math.floor(startVal + (endVal - startVal) * easedProgress);

              setCurrentValue(current);

              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                setCurrentValue(endVal);
              }
            };

            window.requestAnimationFrame(step);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, direction, delay, duration]);

  return (
    <span ref={elementRef} className={`inline-block tabular-nums tracking-tight ${className}`}>
      {prefix}
      {currentValue.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}
