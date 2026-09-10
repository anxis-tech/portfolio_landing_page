"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getAgencyProjects, Project } from "@/data/portfolio";
import { ChevronLeft, ChevronRight, ArrowUpRight, Handshake } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ProjectExpandableModal, ProjectModalOrigin } from "@/components/project-expandable-modal";

export function AgencyCarousel() {
  const agencyProjects = getAgencyProjects();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Estado do Modal Expandido
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [originRect, setOriginRect] = useState<ProjectModalOrigin | null>(null);

  const handleOpenProject = (project: Project, e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

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
    <section id="parcerias" className="pt-10 pb-16 sm:pt-14 sm:pb-20 px-6 sm:px-10 lg:px-14">
      {/* Header com Título e Controles Minimalistas */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
              Projetos em parceria
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
            Em colaboração técnica com agências.
          </h2>
        </div>

        {/* Setas de Navegação do Carrossel */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="w-9 h-9 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Projeto anterior"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="w-9 h-9 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
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
            transform: isMobile
              ? `translateX(calc(-${currentIndex} * (100% + 16px)))`
              : `translateX(calc(-${currentIndex} * (50% + 8px)))`,
          }}
        >
          {agencyProjects.map((project) => (
            <SpotlightCard
              key={project.id}
              className="w-full sm:w-[calc(50%-8px)] shrink-0 flex flex-col group p-3 -m-1 rounded-2xl hover:bg-white/80 transition-colors duration-300"
            >
              {/* Imagem do Projeto (Dispara o Modal Expandido) */}
              <div
                onClick={(e) => handleOpenProject(project, e)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenProject(project, e as unknown as React.MouseEvent<HTMLElement>);
                  }
                }}
                aria-label={`Abrir detalhes do projeto ${project.title}`}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-3 block cursor-pointer transition-transform duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#84cc16]"
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 560px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-start justify-end p-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shadow-xs">
                    <span>Explorar</span>
                    <ArrowUpRight size={12} />
                  </span>
                </div>
              </div>

              {/* Informações: Título, Parceria e Descrição */}
              <div>
                <button
                  type="button"
                  onClick={(e) => handleOpenProject(project, e)}
                  className="font-semibold text-[14px] text-neutral-950 uppercase tracking-tight hover:text-neutral-700 transition-colors inline-block text-left cursor-pointer"
                >
                  {project.title}
                </button>

                {/* Parceria com Agência: Logo clicável */}
                <div className="text-[12px] font-medium text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <Handshake size={13} className="text-neutral-400 shrink-0" />
                    <span>Em parceria com:</span>
                  </span>
                  {project.agencyLogo ? (
                    <a
                      href={project.agencyUrl || "https://virtualiti.com.br/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center hover:opacity-80 transition-opacity"
                      title={project.agency ? `Visitar site da agência ${project.agency}` : "Visitar site da agência"}
                    >
                      <Image
                        src={project.agencyLogo}
                        alt={project.agency || "Virtualiti"}
                        width={110}
                        height={26}
                        unoptimized
                        className="h-5 sm:h-5.5 w-auto object-contain"
                      />
                    </a>
                  ) : (
                    <strong className="font-semibold text-neutral-700">{project.agency}</strong>
                  )}
                </div>

                <p className="text-[12px] text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Modal Expandido com Shared Element Transition */}
      <ProjectExpandableModal
        project={selectedProject}
        originRect={originRect}
        onClose={handleCloseProject}
      />
    </section>
  );
}
