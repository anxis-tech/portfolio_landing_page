"use client";

import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  isPlaceholder?: boolean;
}

interface ProjectGalleryViewerProps {
  projectTitle: string;
  mainImageSrc: string;
  previewSrc?: string; // Mantido para compatibilidade, ignorado se for preview de baixa resolução
  galleryImages?: string[];
  dimensions?: { width: number; height: number };
}

export function ProjectGalleryViewer({
  projectTitle,
  mainImageSrc,
  previewSrc,
  galleryImages = [],
  dimensions,
}: ProjectGalleryViewerProps) {
  const isCrm = mainImageSrc.includes("logoipsum-crm");
  // Construímos a lista de thumbnails (mínimo de 5 itens preenchidos)
  // A 1ª imagem é SEMPRE a imagem principal em altíssima definição (já selecionada por padrão)
  const items: GalleryItem[] = [];

  // Item 1: Imagem principal / tela completa em alta definição
  items.push({
    id: "main-0",
    src: mainImageSrc,
    title: `${projectTitle} - Visão Principal`,
    isPlaceholder: false,
  });

  // Itens da galeria do projeto (apenas imagens de alta resolução; filtramos qualquer preview de baixa qualidade)
  galleryImages
    .filter((img) => img && typeof img === "string" && !img.includes("/previews/"))
    .forEach((img, idx) => {
      if (!items.some((it) => it.src === img)) {
        items.push({
          id: `gallery-${idx}`,
          src: img,
          title: `${projectTitle} - Vista Adicional ${idx + 1}`,
          isPlaceholder: false,
        });
      }
    });

  // Preenchemos sempre até o mínimo de 5 slots (com placeholders quando faltar)
  const totalSlotsNeeded = Math.max(5, items.length);
  for (let i = items.length; i < totalSlotsNeeded; i++) {
    items.push({
      id: `placeholder-${i}`,
      src: "",
      title: `Prévia em breve (${i + 1})`,
      isPlaceholder: true,
    });
  }

  // Estado da imagem ativa em exibição (1ª imagem sempre selecionada inicialmente)
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const activeSrc = activeItem.isPlaceholder ? mainImageSrc : activeItem.src;

  // Estado do Modal de Zoom / Lightbox
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Controle de scroll do carrossel quando houver mais de 5 itens
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items.length]);

  const scrollBy = (offset: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScroll, 250);
    }
  };

  // Fechar zoom com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
    };
    if (isZoomOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen]);

  const isMoreThanFive = items.length > 5;

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* =========================================================================
          IMAGEM PRINCIPAL ATIVA COM ALTURA FIXA E CONSISTENTE (H-540PX NO DESKTOP)
          Se a imagem for mais longa, cria a rolagem vertical suave internamente.
          Renderização em 100% da resolução nativa sem compressão ou degradação.
         ========================================================================= */}
      <div className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-neutral-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] group flex flex-col ${
        isCrm ? "h-[400px] sm:h-[480px] lg:h-[540px]" : "h-[400px] sm:h-[480px] lg:h-[540px]"
      }`}>
        
        {/* Botão de Dica de Zoom Flutuante */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950/80 hover:bg-neutral-950 text-white backdrop-blur-md text-[11px] font-mono font-medium shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="Clique para ampliar em tela cheia"
        >
          <ZoomIn size={13} className="text-[#d8ff7c]" />
          <span className="hidden sm:inline">Ampliar</span>
        </button>

        {/* Contêiner com altura 100% fixa e preenchimento total */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsZoomOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsZoomOpen(true);
            }
          }}
          className={`relative w-full h-full no-scrollbar cursor-zoom-in ${
            isCrm ? "overflow-hidden" : "overflow-y-auto overscroll-contain"
          }`}
          title="Clique para abrir ampliação em tela cheia"
        >
          <img
            src={activeSrc}
            alt={activeItem.title || projectTitle}
            className={`select-none transition-opacity duration-200 ${
              isCrm
                ? "w-full h-full object-cover object-top block"
                : "w-full h-auto block"
            }`}
            loading="eager"
            decoding="sync"
          />

          {/* Overlay suave ao passar o cursor com indicador de zoom */}
          <div className="absolute inset-0 bg-neutral-950/0 group-hover:bg-neutral-950/5 transition-colors pointer-events-none" />
        </div>
      </div>

      {/* =========================================================================
          THUMBNAILS SECUNDÁRIAS (5 NO DESKTOP ADAPTADAS PONTA A PONTA / CARROSSEL SE > 5)
         ========================================================================= */}
      <div className="relative w-full">
        {/* Controles de navegação para carrossel (quando > 5) */}
        {isMoreThanFive && (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-180)}
              disabled={!canScrollLeft}
              className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-neutral-200/90 shadow-md flex items-center justify-center text-neutral-800 transition-all ${
                canScrollLeft ? "opacity-100 hover:scale-105 cursor-pointer" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(180)}
              disabled={!canScrollRight}
              className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-neutral-200/90 shadow-md flex items-center justify-center text-neutral-800 transition-all ${
                canScrollRight ? "opacity-100 hover:scale-105 cursor-pointer" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Rolar para a direita"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Grade de 5 Thumbs ou Carrossel com Scroll Horizontal */}
        <div
          ref={carouselRef}
          onScroll={checkScroll}
          className={
            isMoreThanFive
              ? "flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none py-1 scroll-smooth"
              : "grid grid-cols-5 gap-2 sm:gap-2.5 w-full py-1"
          }
        >
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;

            if (item.isPlaceholder) {
              return (
                <div
                  key={item.id}
                  className={`relative aspect-[16/10] rounded-xl overflow-hidden border border-dashed border-neutral-300/80 bg-neutral-100/60 flex flex-col items-center justify-center p-2 text-center select-none cursor-default pointer-events-none ${
                    isMoreThanFive ? "w-[calc((100%-40px)/5)] shrink-0 min-w-[100px]" : "w-full"
                  }`}
                  title="Espaço reservado para visualização adicional"
                >
                  <div className="w-5 h-5 rounded-md bg-neutral-200/80 flex items-center justify-center text-neutral-400 mb-1">
                    <Eye size={11} />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400 font-medium leading-tight line-clamp-1">
                    Prévia
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 transition-all duration-200 group cursor-pointer focus:outline-hidden ${
                  isMoreThanFive ? "w-[calc((100%-40px)/5)] shrink-0 min-w-[100px]" : "w-full"
                } ${
                  isActive
                    ? "ring-2 ring-neutral-950 ring-offset-2 border-transparent shadow-sm scale-[0.98]"
                    : "border border-neutral-200/80 hover:border-neutral-400 hover:scale-[1.02] opacity-85 hover:opacity-100"
                }`}
                title={item.title}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Indicador de ativação sutil */}
                {isActive && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/30 shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL DE ZOOM / LIGHTBOX EXPANDIDO EM TELA CHEIA
         ========================================================================= */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md transition-all animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Header Flutuante do Modal de Zoom */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-neutral-900/90 text-white px-3.5 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#d8ff7c]" />
              <span className="truncate max-w-xs sm:max-w-md">{activeItem.title || projectTitle}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="w-9 h-9 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              title="Fechar visualização (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Janela de Visualização Ampliada com Scroll Vertical Fluido */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-900 rounded-2xl overflow-y-auto overscroll-contain shadow-2xl border border-white/10 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeSrc}
              alt={activeItem.title || projectTitle}
              className="w-full h-auto block select-none"
              loading="eager"
              decoding="sync"
            />
          </div>
        </div>
      )}
    </div>
  );
}
