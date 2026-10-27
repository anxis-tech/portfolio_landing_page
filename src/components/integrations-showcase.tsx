"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Plug,
  Zap,
  Workflow,
  ShieldCheck,
  Gauge,
  MousePointerClick,
} from "lucide-react";

const CONNECTOR_X = [150, 270, 390, 510, 630, 750];

const BEAMS = [
  { d: "M450 300 C 450 200, 300 120, 150 30", length: 600 },
  { d: "M450 300 C 450 210, 360 130, 270 30", length: 520 },
  { d: "M450 300 C 450 150, 420 80, 390 30", length: 450 },
  { d: "M450 300 C 450 150, 480 80, 510 30", length: 450 },
  { d: "M450 300 C 450 210, 540 130, 630 30", length: 520 },
  { d: "M450 300 C 450 200, 600 120, 750 30", length: 600 },
];

export function IntegrationsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animações só rodam com a seção na tela
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      rootMargin: "120px 0px",
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="integracoes"
      data-animating={isVisible ? "true" : undefined}
      className="pt-8 pb-20 sm:pt-12 sm:pb-24 px-4 sm:px-8 lg:px-12 scroll-mt-24"
    >
      {/* Container Card Estilo Bento Escuro com Borda Fina e Glow Neve */}
      <div className="relative rounded-[2.5rem] bg-[#0C0C0E] border border-neutral-800/80 text-white p-6 sm:p-12 lg:p-16 overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.22)]">
        {/* Glow Radial de Fundo Ambiental */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[320px] rounded-full opacity-20 blur-[110px]"
          style={{
            background:
              "radial-gradient(circle, rgba(163,230,53,0.45) 0%, rgba(163,230,53,0.08) 55%, transparent 80%)",
          }}
        />

        {/* 1. Cabeçalho da Seção com Badge e Tipografia */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/10 px-3 py-1 text-[11px] font-mono font-semibold text-lime-300 ring-1 ring-lime-300/25 uppercase tracking-wider">
            <Plug className="h-3.5 w-3.5 text-lime-300" />
            Integrações
          </span>

          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-5 leading-tight">
            Conecte todo o seu ecossistema digital
          </h2>

          <p className="mx-auto mt-3.5 max-w-xl text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
            Uma arquitetura unificada e veloz. Sincronização em tempo real com as melhores ferramentas e tecnologias do mercado.
          </p>
        </div>

        {/* 2. Área Central de Conexões e Feixes Animados */}
        <div className="relative mx-auto mt-12 max-w-4xl">
          {/* Grade Superior dos 6 Ícones (alinhados matematicamente com os pontos do SVG) */}
          <div className="relative z-10 grid grid-cols-6 place-items-center px-[10%]">
            {/* 1. GitHub */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                GitHub
              </span>
            </div>

            {/* 2. Slack */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <rect width="3" height="8" x="13" y="2" rx="1.5" />
                  <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
                  <rect width="3" height="8" x="8" y="14" rx="1.5" />
                  <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
                  <rect width="8" height="3" x="14" y="13" rx="1.5" />
                  <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
                  <rect width="8" height="3" x="2" y="8" rx="1.5" />
                  <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Slack
              </span>
            </div>

            {/* 3. Trello */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <rect width="3" height="9" x="7" y="7" />
                  <rect width="3" height="5" x="14" y="7" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Trello
              </span>
            </div>

            {/* 4. Figma */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
                  <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
                  <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
                  <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
                  <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Figma
              </span>
            </div>

            {/* 5. Database */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                  <path d="M3 12A9 3 0 0 0 21 12" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Database
              </span>
            </div>

            {/* 6. Cloud */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white transition-colors duration-300 group-hover:text-lime-300"
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Cloud
              </span>
            </div>
          </div>

          {/* SVG com as Curvas e Conectores Animados */}
          <div className="relative mt-3 h-52 sm:h-64 md:h-72 w-full">
            <svg
              viewBox="0 0 900 360"
              className="absolute inset-0 w-full h-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Halo Neon dos Conectores (gradiente em vez de filtro de desfoque) */}
                <radialGradient id="aura-glow">
                  <stop offset="0%" stopColor="#A3E635" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#A3E635" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#A3E635" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Trilhos Estáticos Sutis das Curvas */}
              {BEAMS.map((beam) => (
                <path
                  key={`track-${beam.d}`}
                  d={beam.d}
                  stroke="#A3E635"
                  strokeWidth="1.5"
                  strokeOpacity="0.12"
                  strokeLinecap="round"
                  fill="none"
                />
              ))}

              {/* Círculos Conectores Superiores com Efeito Pulsante */}
              {CONNECTOR_X.map((cx, index) => (
                <g
                  key={cx}
                  className="integration-pulse"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <circle cx={cx} cy="30" r="13" fill="url(#aura-glow)" />
                  <circle cx={cx} cy="30" r="4.5" fill="#A3E635" />
                </g>
              ))}

              {/* Feixes Animados de Luz com Dashoffset Sequencial */}
              {BEAMS.map((beam, index) => (
                <path
                  key={`beam-${beam.d}`}
                  d={beam.d}
                  className="integration-beam"
                  stroke="#A3E635"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  style={
                    {
                      "--beam-length": beam.length,
                      strokeDasharray: beam.length,
                      strokeDashoffset: beam.length,
                      animationDelay: `${index * 0.25}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </svg>

            {/* Emblema Central Iluminado com Ícone Zap */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
              <div
                className="relative inline-flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-lime-400/20 ring-2 ring-lime-300/50 backdrop-blur-md transition-transform duration-300 hover:scale-110"
                style={{
                  boxShadow:
                    "0 0 24px rgba(163,230,53,0.65), 0 0 48px rgba(163,230,53,0.35)",
                }}
              >
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-lime-300 fill-lime-300/25" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Barra Inferior de Destaques (Features com divisores tracejados) */}
        <div className="mx-auto mt-12 sm:mt-14 max-w-4xl pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm text-neutral-300 font-medium">
            <div className="inline-flex items-center gap-2">
              <Workflow className="h-4 w-4 text-lime-300" />
              <span>Sincronização instantânea</span>
            </div>

            <div className="hidden md:block w-16 lg:w-20 h-px border-t border-dashed border-lime-300/30" />

            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-lime-300" />
              <span>Segurança robusta</span>
            </div>

            <div className="hidden md:block w-16 lg:w-20 h-px border-t border-dashed border-lime-300/30" />

            <div className="inline-flex items-center gap-2">
              <Gauge className="h-4 w-4 text-lime-300" />
              <span>Atualizações em tempo real</span>
            </div>

            <div className="hidden md:block w-16 lg:w-20 h-px border-t border-dashed border-lime-300/30" />

            <div className="inline-flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-lime-300" />
              <span>Setup descomplicado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
