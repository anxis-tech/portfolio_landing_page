"use client";

import React from "react";
import { Sparkles, ExternalLink, Code2 } from "lucide-react";
import { projectsData, socialLinksData, profileData } from "@/data/portfolio";
import { ProjectCard } from "@/components/project-card";

export function ProjectsColumn() {
  const freelasLink = socialLinksData.find((item) => item.name === "99Freelas")?.url || "https://www.99freelas.com.br/user/anxis";

  return (
    <main className="space-y-12 sm:space-y-16">
      {/* Right Column Header */}
      <div className="space-y-4 bg-[#181A20] border border-[#272A34] rounded-2xl p-6 sm:p-8 shadow-xl hover:border-[#FF3366]/40 transition-all duration-300 relative overflow-hidden creative-card-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF3366] to-[#E040FB] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-gradient-creative">
              PROJETOS SELECIONADOS
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF3366]/10 via-[#FF7A00]/10 to-[#E040FB]/10 text-white text-xs font-bold border border-[#FF3366]/30 flex items-center gap-1.5 shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-[#FF3366]" />
            <span>{projectsData.length} Projetos Reais</span>
          </span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3F4F6]">
          Trabalhos Recentes & Casos Reais
        </h2>
        
        <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed max-w-2xl">
          Uma seleção de sites, landing pages e soluções web desenvolvidas para clientes reais, priorizando arquitetura limpa, performance extrema e conversão de resultados.
        </p>
      </div>

      {/* Projects Grid (2 per row) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" aria-label="Lista de Projetos">
        {projectsData.map((project, idx) => (
          <ProjectCard key={project.id} project={project} index={idx} />
        ))}
      </section>

      {/* Bottom Contact Section */}
      <section className="bg-[#181A20] border border-[#272A34] rounded-2xl p-8 sm:p-12 shadow-xl hover:shadow-2xl hover:border-[#FF3366]/50 transition-all duration-300 space-y-6 text-center sm:text-left relative overflow-hidden creative-card-glow">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#FF3366]/10 via-[#FF7A00]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-gradient-creative flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF3366]" />
            VAMOS TRABALHAR JUNTOS?
          </span>
          
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3F4F6]">
            Tem um novo projeto em mente?
          </h3>
          
          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl">
            Estou disponível para novos trabalhos e parcerias. Acesse meu perfil verificado no 99Freelas para enviar detalhes da sua proposta.
          </p>
        </div>

        {/* CTA 99Freelas */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <a
            href={freelasLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-creative-gradient hover:opacity-95 text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center space-x-2 group"
          >
            <span>Ver perfil no 99Freelas</span>
            <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </section>

      {/* Footer copyright note */}
      <footer className="text-center sm:text-left text-xs text-[#9CA3AF] pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between border-t border-[#272A34]">
        <p>© {new Date().getFullYear()} {profileData.name} — Web Designer & Developer.</p>
      </footer>
    </main>
  );
}
