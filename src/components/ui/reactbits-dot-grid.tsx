"use client";

import React, { useEffect, useRef } from "react";

interface ReactBitsDotGridProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export function ReactBitsDotGrid({
  dotRadius = 1.4,
  dotSpacing = 16,
  cursorRadius = 420,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 65,
  glowRadius = 180,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = "rgba(18, 18, 18, 0.22)",
  gradientTo = "rgba(18, 18, 18, 0.10)",
  glowColor = "#d8ff7c",
  className = "",
  style = {},
}: ReactBitsDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowCircleRef = useRef<SVGCircleElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const boundsRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });

  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0,
  });

  const rafId = useRef<number | null>(null);
  const factorRef = useRef(0);
  const glowFactorRef = useRef(0);
  const isHoveringRef = useRef(false);

  const propsRef = useRef({
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    glowRadius,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  });

  useEffect(() => {
    propsRef.current = {
      dotRadius,
      dotSpacing,
      cursorRadius,
      cursorForce,
      bulgeOnly,
      bulgeStrength,
      glowRadius,
      sparkle,
      waveAmplitude,
      gradientFrom,
      gradientTo,
    };
  }, [
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    glowRadius,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  ]);

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
    let gradient: CanvasGradient | null = null;
    let isSleeping = false;
    let isSectionInView = true;

    // Build the grid of dots
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
          dots[idx++] = {
            ax: x,
            ay: y,
            sx: x,
            sy: y,
            vx: 0,
            vy: 0,
            x,
            y,
          };
        }
      }

      dotsRef.current = dots;
    }

    // Resize canvas with DPR scaling
    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      boundsRef.current = {
        w,
        h,
        offsetX: rect.left + window.scrollX,
        offsetY: rect.top + window.scrollY,
      };

      gradient = null;
      buildGrid(w, h);
      wakeUp();
    }

    function onWindowResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    }

    // Track mouse speed for organic dynamics
    function updateSpeed() {
      const m = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    function wakeUp() {
      isSleeping = false;
      if (isSectionInView && rafId.current === null) {
        lastTime = performance.now();
        accum = 16.6;
        rafId.current = requestAnimationFrame(renderLoop);
      }
    }

    function stopLoop() {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    }

    let lastTime = 0;
    let accum = 0;
    const FIXED_STEP = 16.666; // 60hz physics step

    function renderLoop(time: number) {
      if (!canvas || !ctx) return;
      rafId.current = requestAnimationFrame(renderLoop);

      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const { w, h } = boundsRef.current;
      const currentProps = propsRef.current;
      const totalDots = dots.length;

      // Integrate physics delta
      accum += Math.min(Math.max(time - lastTime, 0), 100);
      lastTime = time;
      while (accum >= FIXED_STEP) {
        accum -= FIXED_STEP;
        updateSpeed();
      }

      // Smooth cursor speed factor with persistent glow while hovering
      const targetFactor = isCoarsePointer
        ? 0
        : isHoveringRef.current
        ? Math.min(Math.max(mouse.speed / 3, 0.75), 1)
        : 0;

      factorRef.current += (targetFactor - factorRef.current) * 0.08;
      if (factorRef.current < 0.001) factorRef.current = 0;

      const currentFactor = factorRef.current;

      glowFactorRef.current += (currentFactor - glowFactorRef.current) * 0.1;
      if (glowFactorRef.current < 0.001) glowFactorRef.current = 0;

      // Update SVG glow position and opacity
      if (glowCircle) {
        glowCircle.setAttribute("cx", String(mouse.x));
        glowCircle.setAttribute("cy", String(mouse.y));
        glowCircle.style.opacity = String(glowFactorRef.current);
      }

      // Clear Canvas
      ctx.clearRect(0, 0, w, h);

      if (!gradient) {
        gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, currentProps.gradientFrom);
        gradient.addColorStop(1, currentProps.gradientTo);
      }
      ctx.fillStyle = gradient;

      const cRadius = currentProps.cursorRadius;
      const cRadiusSq = cRadius * cRadius;
      const r = currentProps.dotRadius;
      const bulge = currentProps.bulgeOnly;
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

          if (bulge) {
            const t = 1 - dist / cRadius;
            const displacement = t * t * strength * currentFactor;
            dot.sx += (dot.ax - normX * displacement - dot.sx) * 0.15;
            dot.sy += (dot.ay - normY * displacement - dot.sy) * 0.15;
          } else {
            const force =
              (400 / dist) * (mouse.speed * currentProps.cursorForce);
            dot.vx -= normX * force;
            dot.vy -= normY * force;
          }
        } else if (bulge) {
          // Smooth spring return to anchor
          dot.sx += (dot.ax - dot.sx) * 0.1;
          dot.sy += (dot.ay - dot.sy) * 0.1;
        }

        if (
          Math.abs(dot.sx - dot.ax) > 0.05 ||
          Math.abs(dot.sy - dot.ay) > 0.05
        ) {
          allSettled = false;
        }

        ctx.moveTo(dot.sx + r, dot.sy);
        ctx.arc(dot.sx, dot.sy, r, 0, PI2);
      }

      ctx.fill();

      // If all dots have settled to their anchors and mouse is still, pause animation
      if (allSettled && isHoveringRef.current === false) {
        isSleeping = true;
        stopLoop();
      }
    }

    // Pointer move listener on the surrounding section or container
    const target = canvas.closest("section") || canvas.parentElement || window;

    const handlePointerMove = (e: Event) => {
      const pe = e as PointerEvent;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = pe.clientX - rect.left;
      mouseRef.current.y = pe.clientY - rect.top;
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

    if (target) {
      target.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      target.addEventListener("pointerleave", handlePointerLeave);
    }

    // Visibility Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionInView = entry.isIntersecting;
        if (isSectionInView) {
          if (!isSleeping) wakeUp();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    return () => {
      stopLoop();
      observer.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onWindowResize);
      if (target) {
        target.removeEventListener("pointermove", handlePointerMove);
        target.removeEventListener("pointerleave", handlePointerLeave);
      }
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none ${className}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
      aria-hidden="true"
    >
      {/* 1. Canvas de Renderização em 60fps com Física de Deslocamento ReactBits */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* 2. SVG Radial Glow que acompanha suavemente o cursor */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <radialGradient id="reactbits-dot-field-glow">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.45" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          ref={glowCircleRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill="url(#reactbits-dot-field-glow)"
          style={{ opacity: 0, willChange: "opacity, cx, cy", transition: "opacity 300ms ease-out" }}
        />
      </svg>
    </div>
  );
}
