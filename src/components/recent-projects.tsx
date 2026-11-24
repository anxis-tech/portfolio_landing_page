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
  SlidersHorizontal,
  X,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { ProjectExpandableModal, type ProjectModalOrigin } from "@/components/project-expandable-modal";
import { TechBadgeList } from "@/components/ui/tech-badge";
import { motion, AnimatePresence } from "framer-motion";

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

  const activeCategoryObj = FILTER_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <section ref={sectionRef} id="projetos" className="pt-16 sm:pt-20 pb-16 px-6 sm:px-10 lg:px-14">
      {/* Header com Título e Subtítulo */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#d8ff7c] border border-black/20" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
            Vitrine & Soluções Digitais
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
              Sites, sistemas, chatbots e integrações personalizadas.
            </h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-2xl">
              Projetos sob medida focados em alta conversão, automação operacional e autoridade visual para o seu negócio.
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-mono hidden sm:block shrink-0">
            {filteredProjects.length} {filteredProjects.length === 1 ? "projeto" : "projetos"}
          </div>
        </div>
      </div>

      {/* 1. Mobile Filter Pills (Visível apenas em telas menores que lg) */}
      <div className="lg:hidden mb-6 -mx-6 px-6 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = counts[cat.id] ?? 0;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "bg-white text-neutral-700 border border-neutral-200/90 hover:bg-neutral-50 hover:text-neutral-950"
                }`}
              >
                <Icon size={13} className={isActive ? "text-[#d8ff7c]" : "text-neutral-400"} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Layout Principal: Sidebar à Esquerda + Vitrine à Direita */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        {/* Sidebar Desktop (Sticky) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-28 space-y-4">
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between px-2.5 py-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold border-b border-neutral-100 mb-2">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-neutral-500" />
                <span>Filtrar Projetos</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {allProjects.length} total
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {FILTER_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = counts[cat.id] ?? 0;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        size={15}
                        className={isActive ? "text-[#d8ff7c]" : "text-neutral-400"}
                      />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md shrink-0 ${
                        isActive
                          ? "bg-neutral-800 text-neutral-200"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Vitrine de Projetos à Direita */}
        <main className="flex-1 min-w-0 min-h-[520px]">
          {/* Barra de Filtro Ativo */}
          {selectedCategory !== "all" && (
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200/60">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span>Filtrando por:</span>
                <span className="font-semibold text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md">
                  {activeCategoryObj?.label}
                </span>
                <span className="text-neutral-400">({filteredProjects.length})</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectCategory("all")}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <span>Mostrar todos</span>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Grid com Animação Fluida */}
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 p-1"
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
        </main>
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

// Subcomponente de Card de Projeto Individual
interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const imageSrc = getProjectImage(project, true);
  const projectUrl = `/projeto/${project.slug || project.id}`;

  return (
    <Link
      href={projectUrl}
      className="group relative flex flex-col text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 rounded-2xl transition-all duration-300"
    >
      <SpotlightCard
        className="flex flex-col h-full rounded-2xl border border-neutral-200/80 bg-white/90 backdrop-blur-sm p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300"
        spotlightColor="rgba(216, 255, 124, 0.16)"
      >
        {/* Frame da Imagem do Projeto */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 mb-4 group-hover:border-neutral-300 transition-colors">
          <Image
            src={imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Overlay sutil ao passar o cursor com botão de expandir */}
          <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-neutral-950 text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span>Ver detalhes</span>
              <ArrowUpRight size={13} />
            </span>
          </div>

          {/* Badge de Categoria Flutuante */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-black/5 text-[10px] font-mono font-medium text-neutral-700 shadow-2xs">
              {project.category}
            </span>
          </div>
        </div>

        {/* Informações Textuais */}
        <div className="flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif-editorial text-lg sm:text-xl text-neutral-950 font-normal tracking-tight group-hover:text-neutral-700 transition-colors">
              {project.title}
            </h3>
            <span className="text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1">
              <ArrowUpRight size={16} />
            </span>
          </div>

          <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tags de Tecnologias */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 flex-wrap">
              <TechBadgeList
                technologies={project.technologies}
              />
            </div>
          )}
        </div>
      </SpotlightCard>
    </Link>
  );
}
