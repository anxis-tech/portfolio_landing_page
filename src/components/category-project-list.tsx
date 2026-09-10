"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/data/portfolio";
import { ProjectExpandableModal, ProjectModalOrigin } from "@/components/project-expandable-modal";

interface CategoryProjectListProps {
  projects: Project[];
}

export function CategoryProjectList({ projects }: CategoryProjectListProps) {
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project) => (
          <article key={project.id} className="group flex flex-col">
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
              className="relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-3 block cursor-pointer transition-transform duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#84cc16]"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-start justify-end p-2.5">
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shadow-xs">
                  <span>Explorar</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>

            {/* Título do Projeto */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleOpenProject(project, e)}
                className="font-medium text-[15px] text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 leading-snug text-left cursor-pointer"
              >
                <span>{project.title}</span>
              </button>
            </div>

            {/* Categoria / Tipo */}
            <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
              {project.type || project.category}
            </p>

            {/* Parceria com Agência se existir */}
            {project.agencyLogo && (
              <div className="text-[12px] font-medium text-neutral-500 mt-2 flex items-center gap-1.5 flex-wrap">
                <span>Em parceria com:</span>
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
                    width={95}
                    height={22}
                    unoptimized
                    className="h-4 sm:h-4.5 w-auto object-contain"
                  />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Modal Expandido com Shared Element Transition */}
      <ProjectExpandableModal
        project={selectedProject}
        originRect={originRect}
        onClose={handleCloseProject}
      />
    </>
  );
}
