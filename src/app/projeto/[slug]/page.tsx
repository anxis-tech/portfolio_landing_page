import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProjects,
  getProjectByIdOrSlug,
  profileData,
} from "@/data/portfolio";
import { getProjectImage } from "@/lib/project-image";
import imageDetails from "@/data/project-images.json";
import { ArrowLeft, ArrowUpRight, Globe, CheckCircle2, Layers, Calendar, User, Building, FileText, Sparkles } from "lucide-react";
import { TechBadge } from "@/components/ui/tech-badge";
import { ProjectGalleryViewer } from "@/components/project-gallery-viewer";
import { HeaderPill } from "@/components/header-pill";
import { FooterEditorial } from "@/components/footer-editorial";
import { GlobalDotBackground } from "@/components/ui/global-dot-background";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug || project.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectByIdOrSlug(slug);

  if (!project) {
    return {
      title: "Projeto — Portfólio de Mateus Oliveira",
    };
  }

  return {
    title: `${project.title} — ${project.category} | ${profileData.name}`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectByIdOrSlug(slug);

  if (!project) {
    notFound();
  }

  const fullPageSrc = getProjectImage(project);
  const dimensions = imageDetails[project.id as keyof typeof imageDetails] || {
    width: 1200,
    height: 3600,
  };

  const galleryImages = project.gallery && project.gallery.length > 0
    ? project.gallery
    : [];

  const otherProjects = getAllProjects()
    .filter((p) => p.id !== project.id && (project.id !== 'logoipsum-crm' || p.id !== 'mirele-fabro'))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] flex flex-col items-center selection:bg-[#d8ff7c] selection:text-neutral-950">
      {/* Fundo Interativo Global com Dots */}
      <GlobalDotBackground
        dotRadius={1.15}
        dotSpacing={19}
        cursorRadius={320}
        bulgeStrength={40}
        glowRadius={190}
        glowColor="#d8ff7c"
        dotColor="rgba(0, 0, 0, 0.12)"
        opacity={0.45}
      />

      {/* Header Fixo */}
      <HeaderPill />

      <main className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 pt-28 sm:pt-36 pb-20 relative z-10">
        {/* Barra Superior de Navegação */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10">
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-neutral-600 hover:text-neutral-950 transition-colors bg-white/80 backdrop-blur-sm border border-neutral-200/80 hover:border-neutral-300 px-3.5 py-1.5 rounded-full shadow-2xs group"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Voltar aos projetos</span>
          </Link>


        </div>

        {/* =========================================================================
            SEÇÃO 1: IMAGEM PRINCIPAL + INFORMAÇÕES DO PROJETO (ESTILO PRODUTO ÚNICO)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 lg:gap-10 items-start">
          
          {/* COLUNA ESQUERDA: VISUALIZADOR COM ZOOM E 5 THUMBS ADAPTADAS PONTA A PONTA */}
          <div className="w-full">
            <ProjectGalleryViewer
              projectTitle={project.title}
              mainImageSrc={fullPageSrc}
              galleryImages={galleryImages}
              dimensions={dimensions}
            />
          </div>

          {/* COLUNA DIREITA: PAINEL DE INFORMAÇÕES (STICKY) */}
          <aside className="lg:sticky lg:top-32 flex flex-col gap-6">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-6">
              
              {/* Badges de Categoria */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-neutral-950 text-white text-[11px] font-mono font-medium shadow-2xs">
                  {project.type || project.category}
                </span>
                {project.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-mono uppercase"
                  >
                    #{cat}
                  </span>
                ))}
              </div>

              {/* Título & Descrição de Cabeçalho */}
              <div>
                <h1 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight leading-tight">
                  {project.title}
                </h1>
                <p className="text-[14px] text-neutral-600 mt-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tabela de Especificações */}
              <div className="space-y-3 py-4 border-y border-neutral-100 text-[13px]">
                {project.client && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                      <User size={13} />
                      <span>Cliente:</span>
                    </span>
                    <span className="font-medium text-neutral-900 text-right">{project.client}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>Ano:</span>
                  </span>
                  <span className="font-mono text-neutral-900">{project.year || "2026"}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Status:</span>
                  </span>
                  <span className="font-medium text-neutral-900">Entregue & Em Produção</span>
                </div>

                {project.agency && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100/80">
                    <span className="text-neutral-400 font-mono flex items-center gap-1.5">
                      <Building size={13} />
                      <span>Parceria:</span>
                    </span>
                    <span className="font-medium text-neutral-900">{project.agency}</span>
                  </div>
                )}
              </div>

              {/* Tecnologias & Ferramentas */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-2.5 font-semibold">
                    Tecnologias & Integrações
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <TechBadge key={tech} techKey={tech} />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA com a nossa cor verde oficial (#d8ff7c) - Oculto para o CRM por solicitação */}
              {project.link && project.id !== "logoipsum-crm" && (
                <div className="pt-2">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#d8ff7c] hover:bg-[#cbf66a] text-neutral-950 text-[13.5px] font-bold py-3.5 px-5 rounded-xl transition-all duration-200 active:scale-98 shadow-[0_2px_12px_rgba(216,255,124,0.35)] hover:shadow-[0_4px_18px_rgba(216,255,124,0.5)] border border-black/10 group cursor-pointer"
                  >
                    <span>{project.link.startsWith("/") ? "Explorar Demonstração Interativa" : "Acessar Projeto Online"}</span>
                    <ArrowUpRight size={15} className="text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* =========================================================================
            SEÇÃO 2: DESCRIÇÃO APROFUNDADA & DETALHES DO PROJETO (MOLDURA PONTILHADA COMPLETA)
           ========================================================================= */}
        <div className="mt-10 sm:mt-12">
          <div className="w-full p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border-2 border-dotted border-neutral-900/15 bg-white/50 backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} className="text-neutral-500" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
                Visão Geral & Arquitetura
              </span>
            </div>

            <h2 className="font-serif-editorial text-2xl sm:text-3xl lg:text-4xl text-neutral-950 font-normal tracking-tight leading-tight">
              Sobre a concepção e entrega deste projeto
            </h2>

            <div className="mt-6 space-y-4 text-[15px] sm:text-[16px] text-neutral-600 leading-relaxed">
              {project.purpose ? (
                <p className="leading-relaxed">
                  <strong>Propósito da Página:</strong> {project.purpose}
                </p>
              ) : null}
              {project.detailedDescription ? (
                <p className="whitespace-pre-line">{project.detailedDescription}</p>
              ) : (
                <p>
                  O projeto <strong>{project.title}</strong> foi planejado e construído com foco prioritário em aliar uma estética visual limpa e autoral à alta performance de carregamento, responsividade e jornada de conversão. Cada elemento gráfico, espaçamento e hierarquia tipográfica foram desenhados para transmitir credibilidade imediata ao visitante.
                </p>
              )}
            </div>

            {/* Funcionalidades Implementadas */}
            {project.features && project.features.length > 0 ? (
              <div className="mt-8 pt-8 border-t border-neutral-200/80">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 block mb-4">
                  Principais Funcionalidades Implementadas
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-700">
                  {project.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Sparkles size={16} className="text-[#84cc16] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-neutral-200/80">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 block mb-4">
                  Destaques & Diferenciais do Desenvolvimento
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-700">
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#84cc16] shrink-0 mt-0.5" />
                    <span>Design exclusivo desenhado sob medida para o posicionamento da marca.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#84cc16] shrink-0 mt-0.5" />
                    <span>Otimização para velocidade máxima de abertura (Core Web Vitals).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#84cc16] shrink-0 mt-0.5" />
                    <span>Adaptação 100% responsiva para smartphones, tablets e telas retina.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Sparkles size={16} className="text-[#84cc16] shrink-0 mt-0.5" />
                    <span>Estrutura de código semântico e SEO técnico para mecanismos de busca.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SEÇÃO 3: PROJETOS RELACIONADOS / VEJA TAMBÉM
           ========================================================================= */}
        {otherProjects.length > 0 && (
          <div className="mt-12 sm:mt-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                  Mais Cases
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal tracking-tight">
                  Veja outros projetos selecionados
                </h3>
              </div>
              <Link
                href="/#projetos"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition-colors"
              >
                <span>Ver todos</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((p) => {
                const img = getProjectImage(p, true);
                return (
                  <Link
                    key={p.id}
                    href={`/projeto/${p.slug || p.id}`}
                    className="group flex flex-col bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 mb-3">
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 360px"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif-editorial text-lg text-neutral-950 group-hover:text-neutral-700 transition-colors">
                        {p.title}
                      </h4>
                      <ArrowUpRight size={15} className="text-neutral-400 group-hover:text-neutral-950 transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <FooterEditorial />
    </div>
  );
}
