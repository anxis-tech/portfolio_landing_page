"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllProjects, type Project } from "@/data/portfolio";
import { getProjectImage } from "@/lib/project-image";
import {
  ArrowUpRight,
  LayoutGrid,
  Rocket,
  ShoppingBag,
  Building2,
  LayoutDashboard,
  Bot,
  Handshake,
} from "lucide-react";
import { ProjectExpandableModal, type ProjectModalOrigin } from "@/components/project-expandable-modal";
import { TechIconList } from "@/components/ui/tech-badge";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface FilterCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const FILTER_CATEGORIES: FilterCategory[] = [
  { id: "all", label: "Todos os Projetos", icon: LayoutGrid },
  { id: "landing-pages", label: "Landing Pages", icon: Rocket },
  { id: "ecommerce", label: "E-commerce & Lojas", icon: ShoppingBag },
  { id: "institucional", label: "Sites Institucionais", icon: Building2 },
  { id: "sistemas", label: "Sistemas & CRM", icon: LayoutDashboard },
  { id: "chatbots", label: "Chatbots & IA", icon: Bot },
  { id: "parcerias", label: "Parcerias com Agências", icon: Handshake },
];

export function RecentProjects() {
  const allProjects = useMemo(() => getAllProjects(), []);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // Estado do Modal Expandido
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [originRect] = useState<ProjectModalOrigin | null>(null);


  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Quando o usuário clica em uma categoria com menos projetos (ex: Sistemas ou Chatbots),
    // a altura total da grade diminui. Se o usuário estiver mais abaixo na página,
    // garantimos que a rolagem seja reposicionada de forma imediata e elegante no topo da seção de projetos,
    // impedindo que a visualização seja jogada involuntariamente para a seção seguinte (Integrações/Processo).
    if (typeof window !== "undefined") {
      const section = sectionRef.current || document.getElementById("projetos");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < -20) {
          const headerOffset = 70;
          const elementPosition = rect.top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "instant",
          });
        }
      }
    }
  };

  // Contagem dinâmica de projetos por categoria
  const counts = useMemo(() => {
    const result: Record<string, number> = {
      all: allProjects.length,
      "landing-pages": 0,
      ecommerce: 0,
      institucional: 0,
      sistemas: 0,
      chatbots: 0,
      parcerias: 0,
    };

    for (const p of allProjects) {
      if (p.categories?.includes("landing-pages")) result["landing-pages"]++;
      if (p.categories?.includes("ecommerce")) result.ecommerce++;
      if (p.categories?.includes("institucional")) result.institucional++;
      if (p.categories?.includes("sistemas")) result.sistemas++;
      if (p.categories?.includes("chatbots") || p.categories?.includes("integracoes")) result.chatbots++;
      if (p.categories?.includes("parcerias") || p.agencyProject) result.parcerias++;
    }

    return result;
  }, [allProjects]);

  // Projetos filtrados com base na categoria selecionada
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return allProjects;
    if (selectedCategory === "chatbots") {
      return allProjects.filter((p) => p.categories?.includes("chatbots") || p.categories?.includes("integracoes"));
    }
    if (selectedCategory === "parcerias") {
      return allProjects.filter((p) => p.categories?.includes("parcerias") || p.agencyProject);
    }
    return allProjects.filter((p) => p.categories?.includes(selectedCategory));
  }, [allProjects, selectedCategory]);


  return (
    <section ref={sectionRef} id="projetos" className="pt-16 sm:pt-20 pb-16 px-6 sm:px-10 lg:px-14">
      {/* Header com Título e Subtítulo */}
      <div className="mb-8 sm:mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
            Vitrine & Soluções Digitais
          </span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
              Sites, sistemas, chatbots e integrações personalizadas.
            </h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-2xl mx-auto">
              Projetos sob medida focados em alta conversão, automação operacional e autoridade visual para o seu negócio.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono hidden sm:block shrink-0">
            {filteredProjects.length} {filteredProjects.length === 1 ? "projeto" : "projetos"}
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto mb-8">
        <div role="group" aria-label="Filtrar projetos por categoria" className="flex w-max min-w-full flex-nowrap justify-center gap-2 p-1">
        {FILTER_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          const Icon = cat.icon;
          return <button key={cat.id} type="button" aria-pressed={active} onClick={() => handleSelectCategory(cat.id)} className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${active ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"}`}>
            <Icon size={13} /> {cat.label} <span className="font-mono">{counts[cat.id] ?? 0}</span>
          </button>;
        })}
        </div>
      </div>
      <div className="min-w-0 min-h-[520px]">
          {/* Grid com Animação Fluida */}
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
                className="flex flex-wrap justify-center gap-6 p-1"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="bg-white/60 border border-neutral-200/80 rounded-2xl p-12 text-center">
                <p className="text-sm text-neutral-500">
                  Nenhum projeto encontrado nesta categoria no momento.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCategory("all")}
                  className="mt-3 text-xs font-semibold text-neutral-900 underline underline-offset-4 cursor-pointer"
                >
                  Ver todos os projetos
                </button>
              </div>
            )}
          </AnimatePresence>
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

interface ProjectCardProps { project: Project; }
function ProjectCard({ project }: ProjectCardProps) {
  return <Link href={`/projeto/${project.slug || project.id}`} aria-label={`Ver projeto ${project.title}`} className="project-card group relative block w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] min-w-0 rounded-2xl overflow-hidden border border-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950">
    <div className="relative flex flex-col w-full min-h-56 aspect-[4/3] bg-neutral-100">
      <Image src={getProjectImage(project)} alt="" fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover object-top" />
      <div className="project-card-content relative w-full min-w-0 min-h-56 flex-1 flex flex-col items-start justify-end text-left text-white motion-safe:transition-[opacity,transform] motion-safe:duration-200">
        <div className="relative w-full min-w-0 flex flex-col items-start gap-3 px-5 pb-5 pt-6 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.22)_50%,rgba(0,0,0,0.48)_100%)]">
          <h3 className="font-serif-editorial text-xl break-words max-w-full [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{project.title}</h3>
          <TechIconList technologies={project.technologies} />
        </div>
      </div>
      <span aria-hidden="true" className="project-card-hover-cta absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none motion-safe:transition-[opacity,transform] motion-safe:duration-200"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#d8ff7c] px-4 py-2 text-xs font-semibold text-neutral-950">Ver projeto <ArrowUpRight size={14} /></span></span>
    </div>
    <style jsx global>{`
      @media (min-width: 640px) and (hover: hover) and (pointer: fine) {
        .project-card:hover .project-card-content, .project-card:focus-visible .project-card-content { opacity: 0; }
        .project-card:hover .project-card-hover-cta, .project-card:focus-visible .project-card-hover-cta { opacity: 1; }
      }
      @media (min-width: 640px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
        .project-card-hover-cta { transform: translateY(0.5rem); }
        .project-card:hover .project-card-content, .project-card:focus-visible .project-card-content { transform: translateY(-0.5rem); }
        .project-card:hover .project-card-hover-cta, .project-card:focus-visible .project-card-hover-cta { transform: translateY(0); }
      }
    `}</style>
  </Link>;
}
