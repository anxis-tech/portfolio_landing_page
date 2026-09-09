"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getAgencyProjects } from "@/data/portfolio";
import { ChevronLeft, ChevronRight, ArrowUpRight, Handshake } from "lucide-react";

export function AgencyCarousel() {
  const agencyProjects = getAgencyProjects();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const itemsPerView = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, agencyProjects.length - itemsPerView);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section id="parcerias" className="border-t border-neutral-200/80 pt-12 pb-14 px-6 sm:px-10 lg:px-14">
      {/* Header com Título e Controles Minimalistas */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
              Projetos em parceria
            </span>
          </div>
          <p className="text-[12px] text-neutral-500 mt-0.5">
            Trabalhos desenvolvidos em colaboração com agências e estúdios
          </p>
        </div>

        {/* Controles do Carrossel (Setas Discretas e Indicador) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-neutral-400 mr-1.5 hidden sm:inline">
            {String(currentIndex + 1).padStart(2, "0")} / {String(maxIndex + 1).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
              currentIndex === 0
                ? "text-neutral-300 border-neutral-100 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 active:scale-95"
            }`}
            aria-label="Projeto anterior"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
              currentIndex >= maxIndex
                ? "text-neutral-300 border-neutral-100 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 active:scale-95"
            }`}
            aria-label="Próximo projeto"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Contêiner de Visualização do Carrossel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (isMobile ? 100 : 50)}%)`,
          }}
        >
          {agencyProjects.map((project) => (
            <div
              key={project.id}
              className="w-full sm:w-[calc(50%-8px)] shrink-0 flex flex-col group"
            >
              {/* Imagem do Projeto */}
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-3 block cursor-pointer"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-start justify-end p-2.5">
                  <span className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-xs">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </a>

              {/* Informações: Título, Parceria e Descrição */}
              <div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[14px] text-neutral-950 uppercase tracking-tight hover:text-neutral-700 transition-colors inline-block"
                >
                  {project.title}
                </a>

                {project.agency && (
                  <p className="text-[12px] font-medium text-neutral-500 mt-0.5 flex items-center gap-1.5">
                    <Handshake size={12} className="text-neutral-400" />
                    <span>Em parceria com <strong className="font-semibold text-neutral-700">{project.agency}</strong></span>
                  </p>
                )}

                <p className="text-[12px] text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
