"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Bot,
  Workflow,
  ShieldCheck,
  Gauge,
  Smartphone,
} from "lucide-react";

// 8 conectores matematicamente alinhados com as 8 colunas (viewBox 0 0 900 360)
const CONNECTOR_X = [96, 197, 298, 399, 501, 602, 703, 804];

const BEAMS = [
  { d: "M450 300 C 450 215, 250 125, 96 30", length: 600 },
  { d: "M450 300 C 450 210, 310 120, 197 30", length: 500 },
  { d: "M450 300 C 450 205, 365 110, 298 30", length: 420 },
  { d: "M450 300 C 450 200, 420 100, 399 30", length: 370 },
  { d: "M450 300 C 450 200, 480 100, 501 30", length: 370 },
  { d: "M450 300 C 450 205, 535 110, 602 30", length: 420 },
  { d: "M450 300 C 450 210, 590 120, 703 30", length: 500 },
  { d: "M450 300 C 450 215, 650 125, 804 30", length: 600 },
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
      className="pt-8 pb-16 sm:pt-12 sm:pb-20 px-4 sm:px-8 lg:px-12 scroll-mt-24"
    >
      {/* Container Card Estilo Bento Escuro com Borda Fina e Glow */}
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
            <Sparkles className="h-3.5 w-3.5 text-lime-300" />
            IA & Integrações
          </span>

          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mt-5 leading-tight">
            Conecte todo o seu ecossistema digital com IA
          </h2>

          <p className="mx-auto mt-3.5 max-w-2xl text-sm sm:text-base text-neutral-400 font-light leading-relaxed">
            Fluxos inteligentes e automação em tempo real conectando atendimento, marketing, CRM, planilhas e plataformas de venda.
          </p>
        </div>

        {/* 2. Área Central de Conexões e Feixes Animados */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          {/* Grade Superior dos 8 Ícones Oficiais */}
          <div className="relative z-10 grid grid-cols-8 place-items-center px-[5%]">
            {/* 1. WhatsApp */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <Image
                  src="/icons/whatsapp.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                WhatsApp
              </span>
            </div>

            {/* 2. Gmail (Oficial multicolorido 2020) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  viewBox="0 49.4 512 399.42"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 object-contain transition-transform duration-300 group-hover:scale-110"
                >
                  <g fill="none" fillRule="evenodd">
                    <path fill="#4285F4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z" />
                    <path fill="#34A853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z" />
                    <path fill="#FBBC04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z" />
                    <path fill="#EA4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z" />
                    <path fill="#C5221F" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z" />
                  </g>
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Gmail
              </span>
            </div>

            {/* 3. Google Sheets (Oficial multicolorido 2020) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  viewBox="0 0 307 422"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 object-contain transition-transform duration-300 group-hover:scale-110"
                >
                  <path d="M201.354 0L306.824 105.5L254.089 115.091L201.354 105.5L191.766 52.75L201.354 0Z" fill="#188038" />
                  <path d="M201.351 105.5V0H28.7645C12.8721 0 0 12.8758 0 28.7727V393.227C0 409.124 12.8721 422 28.7645 422H278.057C293.949 422 306.821 409.124 306.821 393.227V105.5H201.351Z" fill="#34A853" />
                  <path d="M57.5312 163.047V302.115H249.294V163.047H57.5312ZM141.428 278.138H81.5016V244.57H141.428V278.138ZM141.428 220.592H81.5016V187.024H141.428V220.592ZM225.324 278.138H165.398V244.57H225.324V278.138ZM225.324 220.592H165.398V187.024H225.324V220.592Z" fill="#FFFFFF" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Google Sheets
              </span>
            </div>

            {/* 4. Google Calendar (Oficial multicolorido 2020) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 object-contain transition-transform duration-300 group-hover:scale-110"
                >
                  <path fill="#FFFFFF" d="M390.736 121.264H121.264V390.736H390.736V121.264Z" />
                  <path fill="#EA4335" d="M390.736 512L512 390.736L451.368 380.392L390.736 390.736L379.67 446.196L390.736 512Z" />
                  <path fill="#188038" d="M0 390.736V471.578C0 493.912 18.088 512 40.42 512H121.264L133.714 451.368L121.264 390.736L55.198 380.392L0 390.736Z" />
                  <path fill="#1967D2" d="M512 121.264V40.42C512 18.088 493.912 0 471.58 0H390.736C383.36 30.072 379.671 52.203 379.67 66.392C379.67 80.58 383.359 98.871 390.736 121.264C417.556 128.944 437.767 132.784 451.368 132.784C464.969 132.784 485.18 128.945 512 121.264Z" />
                  <path fill="#FBBC04" d="M512 121.264H390.736V390.736H512V121.264Z" />
                  <path fill="#34A853" d="M390.736 390.736H121.264V512H390.736V390.736Z" />
                  <path fill="#4285F4" d="M390.736 0H40.422C18.088 0 0 18.088 0 40.42V390.736H121.264V121.264H390.736V0Z" />
                  <path fill="#4285F4" d="M176.54 330.308C166.468 323.504 159.494 313.568 155.688 300.428L179.066 290.796C181.186 298.88 184.891 305.145 190.182 309.592C195.436 314.038 201.836 316.228 209.314 316.228C216.959 316.228 223.527 313.903 229.018 309.254C234.51 304.606 237.272 298.678 237.272 291.504C237.272 284.16 234.375 278.164 228.582 273.516C222.788 268.868 215.512 266.544 206.822 266.544H193.314V243.404H205.44C212.917 243.404 219.216 241.382 224.336 237.338C229.456 233.298 232.016 227.772 232.016 220.732C232.016 214.468 229.726 209.482 225.146 205.744C220.566 202.004 214.77 200.118 207.73 200.118C200.858 200.118 195.402 201.938 191.36 205.608C187.319 209.289 184.282 213.937 182.534 219.116L159.394 209.482C162.458 200.792 168.084 193.112 176.336 186.476C184.588 179.84 195.132 176.506 207.932 176.506C217.398 176.506 225.92 178.326 233.466 181.996C241.01 185.668 246.938 190.754 251.216 197.222C255.496 203.722 257.616 210.998 257.616 219.082C257.616 227.334 255.63 234.308 251.656 240.034C247.682 245.76 242.796 250.138 237.002 253.204V254.584C244.483 257.669 250.982 262.735 255.798 269.238C260.682 275.806 263.142 283.654 263.142 292.818C263.142 301.978 260.816 310.164 256.168 317.338C251.52 324.514 245.088 330.172 236.934 334.282C228.75 338.392 219.554 340.482 209.348 340.482C197.524 340.514 186.612 337.112 176.54 330.308ZM320.132 214.298L294.466 232.858L281.632 213.39L327.678 180.176H345.328V336.842H320.132V214.298Z" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Calendar
              </span>
            </div>

            {/* 5. Meta Ads (Oficial Meta SVG) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="#0081FB"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                >
                  <title>Meta Ads</title>
                  <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Meta Ads
              </span>
            </div>

            {/* 6. WooCommerce (Oficial Woo SVG) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <Image
                  src="/icons/woocommerce.svg"
                  alt="WooCommerce"
                  width={24}
                  height={14}
                  className="h-3 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                WooCommerce
              </span>
            </div>

            {/* 7. HubSpot CRM (Oficial HubSpot SVG) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="#FF7A59"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                >
                  <title>HubSpot CRM</title>
                  <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                HubSpot CRM
              </span>
            </div>

            {/* 8. n8n (Oficial n8n SVG) */}
            <div className="group relative flex flex-col items-center">
              <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-lime-300/40 group-hover:scale-105">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="#EA4B71"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                >
                  <title>n8n</title>
                  <path d="M4.8 16.8c.45 0 .6-.15.6-.6V15c0-1.8.6-2.4 2.4-2.4H9c1.8 0 2.4.6 2.4 2.4v1.2c0 .45.15.6.6.6s.6-.15.6-.6V15c0-1.8.6-2.4 2.4-2.4h1.2c1.8 0 2.4.6 2.4 2.4v1.2c0 .45.15.6.6.6s.6-.15.6-.6V15c0-1.8.6-2.4 2.4-2.4h1.2c.45 0 .6-.15.6-.6s-.15-.6-.6-.6h-1.2c-1.8 0-2.4-.6-2.4-2.4V7.8c0-.45-.15-.6-.6-.6s-.6.15-.6.6V9c0 1.8-.6 2.4-2.4 2.4H15c-1.8 0-2.4-.6-2.4-2.4V7.8c0-.45-.15-.6-.6-.6s-.6.15-.6.6V9c0 1.8-.6 2.4-2.4 2.4H7.8c-1.8 0-2.4-.6-2.4-2.4V7.8c0-.45-.15-.6-.6-.6s-.6.15-.6.6V9c0 1.8-.6 2.4-2.4 2.4H.6c-.45 0-.6.15-.6.6s.15.6.6.6h1.2c1.8 0 2.4.6 2.4 2.4v1.2c0 .45.15.6.6.6" />
                </svg>
              </span>
              <span className="absolute -bottom-5 text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                n8n
              </span>
            </div>
          </div>

          {/* SVG com as 8 Curvas e Conectores Animados */}
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

              {/* Trilhos Estáticos Sutis das 8 Curvas */}
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
                  style={{ animationDelay: `${index * 0.18}s` }}
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
                      animationDelay: `${index * 0.22}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </svg>

            {/* Emblema Central Iluminado com Ícone de IA (Bot) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
              <div
                className="relative inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-lime-400/20 ring-2 ring-lime-300/50 backdrop-blur-md transition-transform duration-300 hover:scale-110"
                style={{
                  boxShadow:
                    "0 0 24px rgba(163,230,53,0.65), 0 0 48px rgba(163,230,53,0.35)",
                }}
              >
                <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-lime-300 stroke-[1.8]" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Barra Inferior de Destaques: Linha única compacta */}
        <div className="mx-auto mt-12 sm:mt-14 max-w-5xl pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-nowrap overflow-x-auto scrollbar-none no-scrollbar text-xs sm:text-[13px] text-neutral-300 font-medium whitespace-nowrap">
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <Workflow className="h-3.5 w-3.5 text-lime-300 shrink-0" />
              <span>Automação & IA</span>
            </div>

            <span className="text-white/20 select-none shrink-0">·</span>

            <div className="inline-flex items-center gap-1.5 shrink-0">
              <Smartphone className="h-3.5 w-3.5 text-lime-300 shrink-0" />
              <span>Multi-dispositivos</span>
            </div>

            <span className="text-white/20 select-none shrink-0">·</span>

            <div className="inline-flex items-center gap-1.5 shrink-0">
              <Gauge className="h-3.5 w-3.5 text-lime-300 shrink-0" />
              <span>Tempo real</span>
            </div>

            <span className="text-white/20 select-none shrink-0">·</span>

            <div className="inline-flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-lime-300 shrink-0" />
              <span>Segurança robusta</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
