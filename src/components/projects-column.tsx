"use client";

import React, { useState } from "react";
import { ExternalLink, Briefcase, Code2 } from "lucide-react";
import { projectsData, profileData } from "@/data/portfolio";
import { ProjectCard } from "@/components/project-card";

export function ProjectsColumn() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todos os Projetos" },
    { id: "landing-page", label: "Landing Pages" },
    { id: "institucional", label: "Sites Institucionais" },
    { id: "ecommerce", label: "E-commerce" },
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projectsData
      : projectsData.filter((p) => p.categorySlug === selectedCategory);

  return (
    <main className="space-y-6 sm:space-y-8">
      {/* 1. Header Area: Section Title & Category Filter Pills */}
      <div className="space-y-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#191919] tracking-tight">
              Projetos & Casos Reais
            </h2>
            <p className="text-xs sm:text-sm text-[#696969] mt-0.5">
              Sites e aplicações desenvolvidas com foco em conversão, design e código limpo.
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-bold text-[#191919] shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-[#0057FF]" />
            <span>{projectsData.length} Projetos</span>
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#191919] text-white shadow-xs"
                  : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#191919]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Projects Grid (3 Columns) */}
      <section
        id="projetos"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        aria-label="Grade de Projetos"
      >
        {filteredProjects.map((project, idx) => (
          <ProjectCard key={project.id} project={project} index={idx} />
        ))}
      </section>

      {/* 3. Bottom CTA Box */}
      <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-xs font-bold text-[#0057FF] uppercase tracking-wider">
            Disponível para Novos Projetos
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#191919]">
            Precisa de um site ou landing page de alta conversão?
          </h3>
          <p className="text-xs sm:text-sm text-[#696969] max-w-xl">
            Acesse meu perfil oficial no 99Freelas para enviar detalhes da sua proposta e trabalharmos juntos.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <a
            href={profileData.freelasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0057FF] hover:bg-[#0045CC] text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Contratar no 99Freelas</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/80" />
          </a>
        </div>
      </section>

      {/* 4. Minimalist Footer */}
      <footer className="text-center sm:text-left text-xs text-[#959595] pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E7EB] gap-2">
        <p>© {new Date().getFullYear()} {profileData.name} — Web Designer & Developer.</p>
        <div className="flex items-center space-x-4 font-medium">
          <a href="#projetos" className="hover:text-[#191919] transition-colors">Projetos</a>
          <a href="#sobre" className="hover:text-[#191919] transition-colors">Sobre</a>
          <a href={profileData.freelasUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#191919] transition-colors">99Freelas</a>
        </div>
      </footer>
    </main>
  );
}
