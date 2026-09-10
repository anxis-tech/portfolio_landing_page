"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowUpRight, Globe, Layers, Sparkles } from "lucide-react";
import { Project } from "@/data/portfolio";

export interface ProjectModalOrigin {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ProjectExpandableModalProps {
  project: Project | null;
  originRect: ProjectModalOrigin | null;
  onClose: () => void;
}

export function ProjectExpandableModal({
  project,
  originRect,
  onClose,
}: ProjectExpandableModalProps) {
  const [phase, setPhase] = useState<"idle" | "expanding" | "expanded" | "closing">("idle");
  const [currentStyle, setCurrentStyle] = useState<React.CSSProperties>({});
  const [screenshotRevealed, setScreenshotRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [project]);

  // Listener da tecla Escape
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, phase]);

  // Executar a expansão do card (Shared Element Transition)
  useEffect(() => {
    if (!project) {
      setPhase("idle");
      setScreenshotRevealed(false);
      return;
    }

    const fallbackRect = {
      top: window.innerHeight / 2 - 120,
      left: window.innerWidth / 2 - 180,
      width: 360,
      height: 240,
    };
    const startRect = originRect || fallbackRect;

    // Estado inicial: posicionado exatamente onde estava o card original
    setCurrentStyle({
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      borderRadius: "16px",
      transform: "none",
    });

    setPhase("expanding");

    // Próximo frame: transicionar para a posição e dimensão do modal expandido
    const animFrame = requestAnimationFrame(() => {
      const isMobile = window.innerWidth < 640;
      const targetWidth = isMobile ? "calc(100vw - 24px)" : "min(92vw, 1200px)";
      const targetHeight = isMobile ? "calc(100vh - 40px)" : "min(88vh, 860px)";

      setCurrentStyle({
        top: "50%",
        left: "50%",
        width: targetWidth,
        height: targetHeight,
        borderRadius: isMobile ? "20px" : "24px",
        transform: "translate(-50%, -50%)",
        transition: "all 420ms cubic-bezier(0.16, 1, 0.3, 1)",
      });
    });

    // Fase 2: Revelar a screenshot real full-page
    const revealTimer = setTimeout(() => {
      setScreenshotRevealed(true);
    }, 180);

    // Fase 3: Concluir expansão e revelar detalhes do projeto
    const finishTimer = setTimeout(() => {
      setPhase("expanded");
    }, 440);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(revealTimer);
      clearTimeout(finishTimer);
    };
  }, [project, originRect]);

  // Função para fechar suavemente com animação reversa de morphing
  const handleClose = () => {
    if (phase === "closing" || !project) return;

    setPhase("closing");
    setScreenshotRevealed(false);

    // Rolar o preview de volta ao topo antes de recolher
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    const fallbackRect = {
      top: window.innerHeight / 2 - 120,
      left: window.innerWidth / 2 - 180,
      width: 360,
      height: 240,
    };
    const targetRect = originRect || fallbackRect;

    // Animar de volta às coordenadas originais do card
    setCurrentStyle({
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      borderRadius: "16px",
      transform: "none",
      transition: "all 340ms cubic-bezier(0.25, 0.8, 0.25, 1)",
    });

    // Desmontar após a transição
    setTimeout(() => {
      onClose();
      setPhase("idle");
    }, 350);
  };

  if (!project) return null;

  const fullPageSrc = project.fullPageImage || project.image;
  const isExpanded = phase === "expanded";
  const isClosing = phase === "closing";

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes do projeto ${project.title}`}
    >
      {/* Backdrop Escuro com Blur cobrindo tudo, inclusive o header de fundo */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-400 ease-out cursor-pointer ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* Painel Central com Shared Element Transition */}
      <div
        ref={containerRef}
        style={currentStyle}
        className="fixed z-[10000] bg-white overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] border border-neutral-200/90 flex flex-col will-change-[top,left,width,height,border-radius]"
      >
        {/* =========================================================================
            BARRA DE CABEÇALHO DO MODAL (ESTILO BROWSER / CHROME DISCRETO)
           ========================================================================= */}
        <div className="shrink-0 h-13 px-4 sm:px-6 bg-neutral-50/95 border-b border-neutral-200/80 flex items-center justify-between gap-3 select-none">
          {/* Três botões decorativos estilo browser mac + identificador */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <div className="ml-2 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200/80 text-[11px] font-mono text-neutral-500">
              <Globe size={11} className="text-neutral-400" />
              <span className="truncate max-w-[220px]">{project.link.replace(/^https?:\/\//, "")}</span>
            </div>
          </div>

          {/* Lado Direito: Ano do projeto + Botão Fechar em Vermelho Acessível (sem o dot verde) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-[11px] font-mono text-neutral-400">
              <span className="hidden xs:inline text-neutral-600 font-semibold">{project.year || "2026"}</span>
            </div>

            {/* Botão de Fechar Vermelho Acessível de Alto Contraste */}
            <button
              type="button"
              onClick={handleClose}
              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="Fechar modal do projeto (ESC)"
            >
              <X size={14} className="stroke-[2.5]" />
              <span className="hidden xs:inline text-[11px]">Fechar</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CORPO DO MODAL (ÁREA PRINCIPAL: SCREENSHOT FULL-PAGE + PAINEL DE INFO)
           ========================================================================= */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
          
          {/* COLUNA ESQUERDA: VISUALIZADOR DA SCREENSHOT REAL COM SCROLL VERTICAL */}
          <div
            ref={scrollContainerRef}
            className="relative flex-1 h-full overflow-y-auto bg-neutral-100/70 border-b lg:border-b-0 lg:border-r border-neutral-200/80 overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Camada 1: Capa Editorial do Figma (Inicia a expansão) */}
            <div
              className={`absolute inset-0 w-full transition-opacity duration-500 ease-out z-0 pointer-events-none ${
                screenshotRevealed ? "opacity-0" : "opacity-100"
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>

            {/* Camada 2: Screenshot Real Full-Page (Entra suavemente sobre a capa e aceita scroll) */}
            <div
              className={`relative w-full transition-opacity duration-600 ease-out min-h-full ${
                screenshotRevealed ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={fullPageSrc}
                alt={`Screenshot completa do site ${project.title}`}
                width={1440}
                height={3600}
                unoptimized
                priority
                className="w-full h-auto block select-none"
              />
            </div>

            {/* Dica de rolagem com ícone de mouse no desktop e toque no mobile */}
            {isExpanded && (
              <div className="sticky bottom-3.5 inset-x-0 flex justify-center pointer-events-none pb-1 animate-in fade-in duration-500">
                <span className="px-3.5 py-1.5 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[11px] font-medium shadow-lg flex items-center gap-2 border border-white/10">
                  {/* Ícone de Mouse (Desktop) */}
                  <span className="hidden sm:inline-flex items-center">
                    <svg
                      width="14"
                      height="18"
                      viewBox="0 0 14 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <rect x="0.75" y="0.75" width="12.5" height="16.5" rx="6.25" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="7" y1="4" x2="7" y2="7.5" stroke="#d8ff7c" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
                    </svg>
                  </span>
                  {/* Ícone de Dedo/Toque (Mobile) */}
                  <span className="sm:hidden inline-flex items-center">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#d8ff7c]"
                    >
                      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                  </span>
                  {/* Texto: Rolar no desktop, Arraste no mobile */}
                  <span className="font-semibold tracking-wide hidden sm:inline">Rolar</span>
                  <span className="font-semibold tracking-wide sm:hidden">Arraste</span>
                </span>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: PAINEL DE INFORMAÇÕES E AÇÕES DO PROJETO */}
          <div
            className={`p-6 sm:p-7 flex flex-col justify-between overflow-y-auto bg-white transition-all duration-300 ${
              phase === "expanding" ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="space-y-5">
              {/* Badge de Categoria */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-mono font-semibold border border-neutral-200/80">
                  {project.type || project.category}
                </span>
                {project.client && (
                  <span className="text-[12px] text-neutral-500 font-mono">
                    · {project.client}
                  </span>
                )}
              </div>

              {/* Título Principal do Case */}
              <div>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight leading-tight">
                  {project.title}
                </h3>
                <p className="text-[14px] text-neutral-600 mt-2.5 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Parceria com Agência se existir */}
              {project.agencyLogo && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5 font-semibold">
                    Em parceria com:
                  </span>
                  <a
                    href={project.agencyUrl || "https://virtualiti.com.br/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={project.agencyLogo}
                      alt={project.agency || "Virtualiti"}
                      width={100}
                      height={24}
                      unoptimized
                      className="h-4.5 w-auto object-contain"
                    />
                  </a>
                </div>
              )}

              {/* Tags de Categorias */}
              {project.categories && project.categories.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2 font-semibold">
                    Segmentos
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/projetos/${cat}`}
                        onClick={handleClose}
                        className="text-[11px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        #{cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloco Inferior: CTA "Ver projeto completo ↗" (Único que direciona para a URL externa) */}
            <div className="pt-6 mt-6 border-t border-neutral-100">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white hover:text-[#d8ff7c] text-[13px] font-semibold tracking-tight py-3.5 px-5 rounded-xl transition-all duration-200 active:scale-98 shadow-sm group cursor-pointer"
              >
                <span>Ver projeto completo</span>
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
