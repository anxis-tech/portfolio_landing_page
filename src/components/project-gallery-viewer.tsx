"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
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
  previewSrc?: string;
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
  // Construímos a lista de thumbnails (mínimo de 5 itens preenchidos)
  // A 1ª imagem é SEMPRE a imagem principal em altíssima definição
  const items: GalleryItem[] = useMemo(() => {
    const list: GalleryItem[] = [
      {
        id: "main-0",
        src: mainImageSrc,
        title: `${projectTitle} - Visão Principal`,
        isPlaceholder: false,
      },
    ];

    galleryImages
      .filter((img) => img && typeof img === "string" && !img.includes("/previews/"))
      .forEach((img, idx) => {
        if (!list.some((it) => it.src === img)) {
          list.push({
            id: `gallery-${idx}`,
            src: img,
            title: `${projectTitle} - Vista Adicional ${idx + 1}`,
            isPlaceholder: false,
          });
        }
      });

    const totalSlotsNeeded = Math.max(5, list.length);
    for (let i = list.length; i < totalSlotsNeeded; i++) {
      list.push({
        id: `placeholder-${i}`,
        src: "",
        title: `Prévia em breve (${i + 1})`,
        isPlaceholder: true,
      });
    }

    return list;
  }, [projectTitle, mainImageSrc, galleryImages]);

  // Apenas as imagens reais (não placeholders) para navegação no zoom
  const realItems = useMemo(() => items.filter((it) => !it.isPlaceholder), [items]);

  // Estado da imagem ativa em exibição
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];
  const activeSrc = activeItem.isPlaceholder ? mainImageSrc : activeItem.src;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    setIsLandscape(false);
  }, [activeSrc]);

  const isCover =
    isLandscape ||
    activeSrc.includes("_cover") ||
    activeSrc.includes("-cover") ||
    activeSrc.includes("logoipsum-crm") ||
    activeSrc.includes("drexgames-admin") ||
    (dimensions ? dimensions.height <= dimensions.width * 1.3 : false);

  // Estado do Modal de Zoom / Lightbox
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Controle de scroll do carrossel de miniaturas
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

  // Funções de navegação anterior/próximo
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (realItems.length <= 1) return;
    setActiveIndex((current) => {
      const currentRealIdx = realItems.findIndex((it) => it.id === items[current]?.id);
      const nextRealIdx = currentRealIdx > 0 ? currentRealIdx - 1 : realItems.length - 1;
      return items.findIndex((it) => it.id === realItems[nextRealIdx]?.id);
    });
  }, [realItems, items]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (realItems.length <= 1) return;
    setActiveIndex((current) => {
      const currentRealIdx = realItems.findIndex((it) => it.id === items[current]?.id);
      const nextRealIdx = currentRealIdx < realItems.length - 1 ? currentRealIdx + 1 : 0;
      return items.findIndex((it) => it.id === realItems[nextRealIdx]?.id);
    });
  }, [realItems, items]);

  // Teclado: Escape para fechar zoom, Setas Esquerda/Direita para trocar imagem
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false);
      } else if (realItems.length > 1) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isZoomOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isZoomOpen, realItems.length, handlePrev, handleNext]);

  const isMoreThanFive = items.length > 5;
  const hasMultipleRealItems = realItems.length > 1;

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* =========================================================================
          IMAGEM PRINCIPAL ATIVA (COM SCROLL VERTICAL SUAVE E SUPORTE A CARROSSEL)
         ========================================================================= */}
      <div className="group relative w-full aspect-[16/10] sm:aspect-[16/10] bg-neutral-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Badge flutuante de Zoom no topo direito */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[11px] font-medium shadow-md border border-white/10">
            <ZoomIn size={12} className="text-[#d8ff7c]" />
            <span>Expandir</span>
          </span>
        </div>

        {/* Indicador de posição do carrossel no topo esquerdo (quando houver > 1 imagem) */}
        {hasMultipleRealItems && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-900/85 backdrop-blur-md text-white text-[11px] font-mono font-medium shadow-md border border-white/10">
              {realItems.findIndex((it) => it.id === activeItem.id) + 1} / {realItems.length}
            </span>
          </div>
        )}

        {/* Setas flutuantes de navegação anterior/próxima na imagem principal */}
        {hasMultipleRealItems && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Imagem anterior"
              title="Imagem anterior (Seta esquerda)"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Próxima imagem"
              title="Próxima imagem (Seta direita)"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Área clicável da imagem para abrir o Lightbox ampliado */}
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
            isCover ? "overflow-hidden" : "overflow-y-auto overscroll-contain"
          }`}
          title="Clique para abrir ampliação em tela cheia"
        >
          <img
            key={activeSrc}
            src={activeSrc}
            alt={activeItem.title || projectTitle}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const ratio = img.naturalHeight / img.naturalWidth;
                if (ratio < 1.3) {
                  setIsLandscape(true);
                }
              }
            }}
            className={`select-none transition-opacity duration-200 ${
              isCover
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

                {isActive && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/30 shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL DE ZOOM / LIGHTBOX EXPANDIDO EM TELA CHEIA (COM NAVEGAÇÃO DE CARROSSEL)
         ========================================================================= */}
      {isZoomOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-neutral-950/90 backdrop-blur-md transition-all animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Header Flutuante do Modal de Zoom */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 bg-neutral-900/95 text-white px-3.5 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#d8ff7c]" />
              <span className="truncate max-w-xs sm:max-w-md">{activeItem.title || projectTitle}</span>
              {hasMultipleRealItems && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10.5px] font-mono text-neutral-300">
                  {realItems.findIndex((it) => it.id === activeItem.id) + 1} / {realItems.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="w-9 h-9 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              aria-label="Fechar visualização (Esc)"
              title="Fechar visualização (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Setas flutuantes no Lightbox de Zoom (quando houver > 1 imagem) */}
          {hasMultipleRealItems && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Imagem anterior"
                title="Imagem anterior (Seta esquerda)"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Próxima imagem"
                title="Próxima imagem (Seta direita)"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Janela de Visualização Ampliada com Scroll Vertical Fluido */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-900 rounded-2xl overflow-y-auto overscroll-contain shadow-2xl border border-white/10 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={activeSrc}
              src={activeSrc}
              alt={activeItem.title || projectTitle}
              className="w-full h-auto block select-none"
              loading="eager"
              decoding="sync"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
