"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentProjects, Project } from "@/data/portfolio";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

export function RecentProjects() {
  const [showAll, setShowAll] = useState(false);
  const recentProjects = getRecentProjects();

  const initialProjects = recentProjects.slice(0, 3);
  const extraProjects = recentProjects.slice(3, 6);

  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <section id="projetos" className="border-t border-neutral-200/80 pt-12 pb-14 px-6 sm:px-10 lg:px-14">
      {/* Header da Seção */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
          Projetos recentes
        </span>
        <span className="text-[12px] text-neutral-400">
          {recentProjects.length} trabalhos selecionados
        </span>
      </div>

      {/* Grid Principal (3 Projetos Iniciais) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 lg:gap-8">
        {initialProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Área Expansível (Mais 3 Projetos com Animação Suave) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 lg:gap-8 transition-all duration-500 ease-in-out overflow-hidden ${
          showAll ? "max-h-[1400px] opacity-100 mt-6 sm:mt-6 lg:mt-8 pt-2" : "max-h-0 opacity-0 pointer-events-none mt-0"
        }`}
      >
        {extraProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Botão Centralizado "Ver mais" / "Ver menos" */}
      {extraProjects.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={toggleShowAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-[13px] font-medium text-neutral-800 transition-all duration-200 shadow-2xs active:scale-98 cursor-pointer group"
          >
            <span>{showAll ? "Ver menos" : "Ver mais"}</span>
            {showAll ? (
              <ChevronUp size={15} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
            ) : (
              <ChevronDown size={15} className="text-neutral-500 group-hover:text-neutral-900 transition-colors" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex flex-col">
      {/* Imagem do Projeto */}
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-3 block cursor-pointer transition-transform duration-300"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 240px"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-start justify-end p-2.5">
          <span className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-xs">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </a>

      {/* Título do Projeto */}
      <div className="flex items-center justify-between">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[14px] text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 leading-snug"
        >
          <span>{project.title}</span>
        </a>
      </div>

      {/* Categoria / Tipo */}
      <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
        {project.type || project.category}
      </p>

      {/* Categorias / Tags navegáveis */}
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
    </div>
  );
}
