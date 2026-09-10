"use client";

import React from "react";
import { ReactBitsDotGrid } from "./reactbits-dot-grid";

export function HeroInteractiveBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
      aria-hidden="true"
    >
      <ReactBitsDotGrid
        dotRadius={1.35}
        dotSpacing={17}
        cursorRadius={380}
        cursorForce={0.12}
        bulgeOnly={true}
        bulgeStrength={55}
        glowRadius={210}
        glowColor="#d8ff7c"
        gradientFrom="rgba(0, 0, 0, 0.22)"
        gradientTo="rgba(0, 0, 0, 0.10)"
      />
    </div>
  );
}

