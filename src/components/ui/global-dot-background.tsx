"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface GlobalDotBackgroundProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeStrength?: number;
  glowRadius?: number;
  glowColor?: string;
  dotColor?: string;
  opacity?: number;
}

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  x: number;
  y: number;
}

export function GlobalDotBackground({
  dotRadius = 1.2,
  dotSpacing = 18,
  cursorRadius = 340,
  bulgeStrength = 45,
  glowRadius = 200,
  glowColor = "#d8ff7c",
  dotColor = "rgba(0, 0, 0, 0.14)",
  opacity = 0.55,
}: GlobalDotBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCircleRef = useRef<SVGCircleElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);

  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    speed: 0,
  });

  const rafId = useRef<number | null>(null);
  const factorRef = useRef(0);
  const glowFactorRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isSleepingRef = useRef(false);

  const propsRef = useRef({
    dotRadius,
    dotSpacing,
    cursorRadius,
    bulgeStrength,
    glowRadius,
    dotColor,
  });

  useEffect(() => {
    propsRef.current = {
      dotRadius,
      dotSpacing,
      cursorRadius,
      bulgeStrength,
      glowRadius,
      dotColor,
    };
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, glowRadius, dotColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowCircle = glowCircleRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    let resizeTimer: NodeJS.Timeout | null = null;
    let lastTime = 0;
    let accum = 0;
    const FIXED_STEP = 16.666;

    function buildGrid(width: number, height: number) {
      const { dotRadius: r, dotSpacing: s } = propsRef.current;
      const step = r + s;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);
      const startX = (width % step) / 2 + step / 2;
      const startY = (height % step) / 2 + step / 2;
      const dots: Dot[] = new Array(cols * rows);
      let idx = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * step;
          const y = startY + row * step;
          dots[idx++] = { ax: x, ay: y, sx: x, sy: y, x, y };
        }
      }

      dotsRef.current = dots;
    }

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid(w, h);
      wakeUp();
    }

    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 120);
    }

    function wakeUp() {
      isSleepingRef.current = false;
      if (rafId.current === null) {
        lastTime = performance.now();
        accum = FIXED_STEP;
        rafId.current = requestAnimationFrame(renderLoop);
      }
    }

    function stopLoop() {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    }

    function renderLoop(time: number) {
      if (!canvas || !ctx) return;
      rafId.current = requestAnimationFrame(renderLoop);

      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentProps = propsRef.current;
      const totalDots = dots.length;

      accum += Math.min(Math.max(time - lastTime, 0), 100);
      lastTime = time;

      // Skip physics if not enough time
      if (accum < FIXED_STEP) return;
      accum -= FIXED_STEP;

      // Smooth cursor factor
      const targetFactor = isCoarsePointer
        ? 0
        : isHoveringRef.current
        ? 0.85
        : 0;

      factorRef.current += (targetFactor - factorRef.current) * 0.07;
      if (factorRef.current < 0.001) factorRef.current = 0;

      const currentFactor = factorRef.current;

      glowFactorRef.current += (currentFactor - glowFactorRef.current) * 0.09;
      if (glowFactorRef.current < 0.001) glowFactorRef.current = 0;

      // Update SVG glow
      if (glowCircle) {
        glowCircle.setAttribute("cx", String(mouse.x));
        glowCircle.setAttribute("cy", String(mouse.y));
        glowCircle.style.opacity = String(glowFactorRef.current);
      }

      // Clear + draw
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = currentProps.dotColor;

      const cRadius = currentProps.cursorRadius;
      const cRadiusSq = cRadius * cRadius;
      const r = currentProps.dotRadius;
      const strength = currentProps.bulgeStrength;

      let allSettled = currentFactor === 0 && glowFactorRef.current === 0;

      ctx.beginPath();
      const PI2 = Math.PI * 2;

      for (let i = 0; i < totalDots; i++) {
        const dot = dots[i];
        const dx = mouse.x - dot.ax;
        const dy = mouse.y - dot.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < cRadiusSq && currentFactor > 0.01) {
          const dist = Math.sqrt(distSq) || 1;
          const normX = dx / dist;
          const normY = dy / dist;
          const t = 1 - dist / cRadius;
          const displacement = t * t * strength * currentFactor;
          dot.sx += (dot.ax - normX * displacement - dot.sx) * 0.12;
          dot.sy += (dot.ay - normY * displacement - dot.sy) * 0.12;
        } else {
          dot.sx += (dot.ax - dot.sx) * 0.08;
          dot.sy += (dot.ay - dot.sy) * 0.08;
        }

        if (
          Math.abs(dot.sx - dot.ax) > 0.04 ||
          Math.abs(dot.sy - dot.ay) > 0.04
        ) {
          allSettled = false;
        }

        ctx.moveTo(dot.sx + r, dot.sy);
        ctx.arc(dot.sx, dot.sy, r, 0, PI2);
      }

      ctx.fill();

      if (allSettled && !isHoveringRef.current) {
        isSleepingRef.current = true;
        stopLoop();
      }
    }

    // Listen on the entire window for seamless scrolling interaction
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      isHoveringRef.current = true;
      wakeUp();
    };

    const handlePointerLeave = () => {
      isHoveringRef.current = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      wakeUp();
    };

    resizeCanvas();
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      stopLoop();
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 0, opacity }}
      aria-hidden="true"
    >
      {/* Canvas de pontos interativos cobrindo toda a viewport */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* SVG Radial Glow que segue o cursor */}
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <radialGradient id="global-dot-glow">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          ref={glowCircleRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill="url(#global-dot-glow)"
          style={{
            opacity: 0,
            willChange: "opacity, cx, cy",
            transition: "opacity 300ms ease-out",
          }}
        />
      </svg>
    </div>
  );
}
