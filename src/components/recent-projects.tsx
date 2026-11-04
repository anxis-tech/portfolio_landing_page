"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentProjects, type Project } from "@/data/portfolio";
import { getProjectImage } from "@/lib/project-image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { ProjectExpandableModal, type ProjectModalOrigin } from "@/components/project-expandable-modal";

const ITEMS_PER_PAGE = 6;

export function RecentProjects() {
  const recentProjects = getRecentProjects();

  // Divide os projetos em páginas de 6 em 6
  const pages = useMemo(() => {
    const chunks: Project[][] = [];
    for (let i = 0; i < recentProjects.length; i += ITEMS_PER_PAGE) {
      chunks.push(recentProjects.slice(i, i + ITEMS_PER_PAGE));
    }
    return chunks;
  }, [recentProjects]);

  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pages.length;

  // Estado do Modal Expandido
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [originRect, setOriginRect] = useState<ProjectModalOrigin | null>(null);

  const handleOpenProject = (project: Project, rect: ProjectModalOrigin) => {
    setOriginRect(rect);
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Suporte a swipe por toque em dispositivos móveis
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentPage < totalPages - 1) {
      nextPage();
    } else if (distance < -minSwipeDistance && currentPage > 0) {
      prevPage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="projetos" className="pt-16 sm:pt-20 pb-16 px-6 sm:px-10 lg:px-14">
      {/* Header com Título e Controles Minimalistas do Carrossel */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
              Sites institucional, ecommerce e landing pages
            </span>
          </div>
          <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
            Sites institucional, ecommerce e landing pages.
          </h2>
        </div>

        {/* Setas de Navegação do Carrossel (Estilo idêntico à seção de parcerias) */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-neutral-400 mr-1 hidden sm:inline">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="w-9 h-9 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Página anterior de projetos"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
              className="w-9 h-9 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-700 transition-colors shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Próxima página de projetos"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Contêiner do Carrossel com Transição de 6 em 6 Projetos */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentPage * 100}%)`,
          }}
        >
          {pages.map((pageProjects, pageIndex) => (
            <div
              key={pageIndex}
              className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 p-1"
            >
              {pageProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={handleOpenProject}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Expandido com Shared Element Transition */}
      {selectedProject && (
        <ProjectExpandableModal
          project={selectedProject}
          originRect={originRect}
          onClose={handleCloseProject}
        />
      )}
    </section>
  );
}

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (project: Project, rect: ProjectModalOrigin) => void;
}) {
  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    onSelect(project, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      previewSrc: e.currentTarget.closest(".group")?.querySelector("img")?.currentSrc,
    });
  };

  return (
    <SpotlightCard className="group flex flex-col p-2.5 -m-2.5 rounded-2xl hover:bg-white/80 transition-colors duration-300">
      {/* Imagem do Projeto (Dispara o Modal Expandido) */}
      <div
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
        aria-label={`Abrir detalhes do projeto ${project.title}`}
        className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-3 block cursor-pointer transition-transform duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#84cc16]"
      >
        <Image
          src={getProjectImage(project, true)}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, 560px"
          className="project-scroll-card-image"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-start justify-end p-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shadow-xs">
            <span>Explorar</span>
            <ArrowUpRight size={12} />
          </span>
        </div>

        {/* Magic UI Shine Border Effect na borda da imagem */}
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={["#d8ff7c", "#22c55e", "#84cc16", "#d8ff7c"]}
        />
      </div>

      {/* Título do Projeto (Dispara o Modal Expandido) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCardClick}
          className="font-medium text-[14px] text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 leading-snug text-left cursor-pointer"
        >
          <span>{project.title}</span>
        </button>
      </div>

      {/* Categoria / Tipo */}
      <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
        {project.type || project.category}
      </p>

      {/* Categorias / Tags navegáveis (Levam para a página de categoria) */}
      {project.categories && project.categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {project.categories.slice(0, 2).map((catSlug) => (
            <Link
              key={catSlug}
              href={`/projetos/${catSlug}`}
              className="text-[10px] font-medium text-neutral-400 hover:text-neutral-800 bg-neutral-100/80 hover:bg-neutral-200/70 px-2 py-0.5 rounded-md transition-colors"
            >
              #{catSlug}
            </Link>
          ))}
        </div>
      )}
    </SpotlightCard>
  );
}
