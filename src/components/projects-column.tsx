"use client";

import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { projectsData, socialLinksData, profileData } from "@/data/portfolio";
import { ProjectCard } from "@/components/project-card";

export function ProjectsColumn() {
  const freelasLink = socialLinksData.find((item) => item.name === "99Freelas")?.url || "https://www.99freelas.com.br/user/anxis";

  return (
    <main className="space-y-12 sm:space-y-16">
      {/* Right Column Header */}
      <div className="space-y-3 bg-[#FFFFFF] border border-[#E7E1DB] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#C96A4A]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96A4A]">
            PROJETOS SELECIONADOS
          </span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
          Trabalhos Recentes & Estudos de Caso
        </h2>
        
        <p className="text-sm sm:text-base text-[#73706C] leading-relaxed max-w-2xl">
          Uma seleção de sites, landing pages e experiências digitais desenvolvidas para diferentes projetos e segmentos, priorizando performance, conversão e estética refinada.
        </p>
      </div>

      {/* Projects Grid (2 per row) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" aria-label="Lista de Projetos">
        {projectsData.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>

      {/* Bottom Contact Section */}
      <section className="bg-[#FFFFFF] border border-[#E7E1DB] rounded-2xl p-8 sm:p-12 shadow-xs space-y-6 text-center sm:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C96A4A]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96A4A] flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            VAMOS TRABALHAR JUNTOS?
          </span>
          
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252525]">
            Tem um projeto em mente?
          </h3>
          
          <p className="text-sm sm:text-base text-[#73706C] max-w-xl">
            Estou disponível para novos trabalhos e parcerias. Confira meu perfil no 99Freelas para enviar sua proposta.
          </p>
        </div>

        {/* CTA 99Freelas */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={freelasLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#C96A4A] hover:bg-[#B25638] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-xs flex items-center justify-center space-x-2 group"
          >
            <span>Ver perfil no 99Freelas</span>
            <ExternalLink className="w-4 h-4 text-[#FFFFFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </section>

      {/* Footer copyright note */}
      <footer className="text-center sm:text-left text-xs text-[#73706C] pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between border-t border-[#E7E1DB]">
        <p>© {new Date().getFullYear()} {profileData.name} — Design & Desenvolvimento Web.</p>
      </footer>
    </main>
  );
}
