"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { servicesHelpData } from "@/data/portfolio";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function ServicesHelp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const itemsPerView = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, servicesHelpData.length - itemsPerView);
  const activeIndex = Math.min(currentIndex, maxIndex);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <section id="servicos" className="pt-10 pb-20 sm:pt-14 sm:pb-24 px-6 sm:px-10 lg:px-14">
      {/* Cabeçalho da Seção com Título e Controles de Passar Cards */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
              Como posso ajudar
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight mt-0">
            Estratégia, design visual e sistemas sob medida.
          </h2>
        </div>

        {/* Controles do Carrossel (Setas e Contador de Slides) */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[12px] font-mono text-neutral-400 mr-2 font-medium">
            {String(activeIndex + 1).padStart(2, "0")} / {String(maxIndex + 1).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={prevSlide}
            disabled={activeIndex === 0}
            className={`w-9 h-9 rounded-full border border-neutral-200/90 flex items-center justify-center transition-all duration-200 ${
              activeIndex === 0
                ? "text-neutral-300 border-neutral-100 bg-neutral-50/50 cursor-not-allowed"
                : "text-neutral-800 bg-white hover:bg-neutral-100 hover:border-neutral-300 active:scale-95 shadow-2xs"
            }`}
            aria-label="Card anterior"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={activeIndex >= maxIndex}
            className={`w-9 h-9 rounded-full border border-neutral-200/90 flex items-center justify-center transition-all duration-200 ${
              activeIndex >= maxIndex
                ? "text-neutral-300 border-neutral-100 bg-neutral-50/50 cursor-not-allowed"
                : "text-neutral-800 bg-white hover:bg-neutral-100 hover:border-neutral-300 active:scale-95 shadow-2xs"
            }`}
            aria-label="Próximo card"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Contêiner de Visualização do Slider ("Passar os Cards" com Imagens Ampliadas) */}
      <div
        className="overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out gap-5 sm:gap-6"
          style={{
            transform: isMobile
              ? `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 20}px))`
              : `translateX(calc(-${activeIndex * 50}% - ${activeIndex * 12}px))`,
          }}
        >
          {servicesHelpData.map((service) => (
            <SpotlightCard
              key={service.number}
              className="w-full md:w-[calc(50%-12px)] shrink-0 rounded-2xl overflow-hidden group relative"
            >
              {/* Imagem Full-Bleed como Fundo do Card */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradiente escuro inferior para legibilidade do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Numeração — Topo Esquerdo */}
                <span className="absolute top-4 left-4 text-[12px] font-mono font-semibold tracking-wider text-white/80">
                  {service.number}
                </span>

                {/* Dot Verde — Topo Direito */}
                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#d8ff7c] shadow-sm group-hover:scale-125 transition-transform duration-300" />

                {/* Título — Inferior Esquerdo */}
                <h3 className="absolute bottom-5 left-5 right-5 font-serif-editorial text-xl sm:text-2xl text-white font-normal leading-snug drop-shadow-md">
                  {service.title}
                </h3>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Indicadores de Paginação em Dots Interativos */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? "w-8 bg-neutral-900"
                : "w-2 bg-neutral-200 hover:bg-neutral-400"
            }`}
            aria-label={`Ir para o card ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
