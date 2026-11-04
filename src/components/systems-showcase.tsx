"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  Lock,
  Maximize2,
  Sparkles,
  Check,
  ExternalLink,
  Layers,
} from "lucide-react";
import { getSystemsProjects, Project } from "@/data/portfolio";

const VIRTUAL_DESKTOP_WIDTH = 1366;

export function SystemsShowcase() {
  const systems = getSystemsProjects();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Controle de Viewport Virtual Escalado
  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [virtualHeight, setVirtualHeight] = useState<number>(780);

  const activeProject: Project = systems[currentIndex] || systems[0];
  const isInteractiveIframe = Boolean(activeProject?.link && (activeProject.link.startsWith("/crm") || activeProject.link.startsWith("/drexgames-admin")));

  useEffect(() => {
    const el = viewportContainerRef.current;
    if (!el) return;

    const calculateScale = () => {
      const containerWidth = el.clientWidth;
      const containerHeight = el.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;

      const currentScale = Math.min(1, containerWidth / VIRTUAL_DESKTOP_WIDTH);
      setScale(currentScale);
      setVirtualHeight(containerHeight / currentScale);
    };

    calculateScale();
    const ro = new ResizeObserver(calculateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentIndex]);

  const handleSelectIndex = (index: number) => {
    if (index === currentIndex) return;
    setIsLoading(true);
    setCurrentIndex(index);
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = `${activeProject.link}?embed=true&_t=${Date.now()}`;
    }
  };

  const cleanDisplayUrl = activeProject?.link?.startsWith("http")
    ? activeProject.link.replace(/^https?:\/\//, "")
    : `mateusoliveira.dev${activeProject?.link || "/crm"}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const fullUrl = activeProject?.link?.startsWith("http")
        ? activeProject.link
        : `${window.location.origin}${activeProject?.link || "/crm"}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <section id="sistemas" className="pt-16 sm:pt-20 pb-16 px-6 sm:px-10 lg:px-14">
      {/* 1. Header Editorial da Seção */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] border border-black/20" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
            Sistemas & Plataformas Web
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
              Sistemas empresariais, CRM e painéis interativos.
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Plataformas web sob medida para gestão corporativa: pipelines em Kanban, mensageria multicanal via WhatsApp, precificação inteligente e controle de permissões. Selecione o projeto abaixo para navegar diretamente na interface:
            </p>
          </div>
        </div>
      </div>

      {/* 2. Botões Superiores com Referência aos Projetos de Sistemas */}
      <div className="mb-5 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {systems.map((proj, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={proj.id}
              type="button"
              onClick={() => handleSelectIndex(idx)}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-neutral-950 text-white shadow-xs scale-[1.01]"
                  : "bg-white hover:bg-neutral-100/80 text-neutral-700 hover:text-neutral-950 border border-neutral-200/90"
              }`}
            >
              <Layers size={14} className={isActive ? "text-[#38bdf8]" : "text-neutral-400"} />
              <span>{proj.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Moldura de Navegador macOS com Visualização do Projeto Selecionado */}
      <div className="relative rounded-2xl border border-neutral-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
        {/* Barra Superior do Navegador */}
        <div className="h-11 bg-neutral-100/90 border-b border-neutral-200/80 px-4 flex items-center justify-between gap-3">
          {/* Botões do macOS */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40" />
          </div>

          {/* Barra de Endereço Real do Sistema Selecionado */}
          <div
            onClick={handleCopyLink}
            className="flex-1 max-w-md mx-auto h-7 rounded-lg bg-white border border-neutral-200/80 px-3 flex items-center justify-between text-[11px] text-neutral-500 font-mono select-none cursor-pointer hover:border-neutral-300 transition-colors"
            title="Clique para copiar o link oficial do sistema"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Lock size={10} className="text-emerald-600 shrink-0" />
              <span className="text-neutral-400">https://</span>
              <span className="text-neutral-800 font-semibold truncate">{cleanDisplayUrl}</span>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
              {copiedUrl ? <Check size={12} className="text-emerald-600" /> : "Copiar"}
            </span>
          </div>

          {/* Ações Rápidas da Janela */}
          <div className="flex items-center gap-1.5">
            {isInteractiveIframe && (
              <span
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 bg-neutral-200/60"
                title="Resolução nativa desktop com escala adaptativa"
              >
                1366px ({Math.round(scale * 100)}%)
              </span>
            )}
            {isInteractiveIframe && (
              <button
                type="button"
                onClick={handleReload}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                title="Recarregar tela do CRM"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <Link
              href={activeProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors"
              title="Abrir em tela cheia"
            >
              <Maximize2 size={13} />
            </Link>
          </div>
        </div>

        {/* Viewport do Projeto Selecionado com Virtual Desktop Escalado */}
        <div
          ref={viewportContainerRef}
          className="relative w-full h-[650px] sm:h-[720px] lg:h-[780px] bg-[#fdfdfd] overflow-hidden"
        >
          {isInteractiveIframe ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xs gap-3">
                  <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                  <span className="text-xs font-medium text-neutral-500 font-sans">
                    Carregando interface interativa do {activeProject.title}...
                  </span>
                </div>
              )}

              {/* Viewport Virtual com Escala Proporcional para Preservar Layout Desktop */}
              <div
                style={{
                  width: `${VIRTUAL_DESKTOP_WIDTH}px`,
                  height: `${virtualHeight}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                className="absolute top-0 left-0 will-change-transform"
              >
                <iframe
                  ref={iframeRef}
                  src={`${activeProject.link}?embed=true`}
                  title={activeProject.title}
                  onLoad={() => setIsLoading(false)}
                  className="w-full h-full border-0 select-text"
                  allow="clipboard-write"
                />
              </div>
            </>
          ) : (
            <div className="relative w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
              {activeProject.image && (
                <Image
                  src={activeProject.image}
                  alt={activeProject.title}
                  fill
                  className="object-cover opacity-85"
                />
              )}
              <div className="relative z-10 max-w-lg bg-neutral-950/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white">
                <span className="text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                  {activeProject.type || activeProject.category}
                </span>
                <h3 className="text-xl font-bold mt-1 text-white">{activeProject.title}</h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{activeProject.description}</p>
                <div className="mt-4 flex justify-center">
                  <Link
                    href={activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Acessar sistema</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Informativo da Janela */}
        <div className="px-5 py-3 bg-neutral-50/90 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span>
              <strong>Dica:</strong> Alterne entre os sistemas nos botões superiores e experimente o painel interativo em tempo real.
            </span>
          </div>

          <Link
            href={activeProject.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-neutral-900 hover:text-neutral-600 underline underline-offset-2 shrink-0 flex items-center gap-1"
          >
            <span>Ver projeto completo</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </section>
  );
}
