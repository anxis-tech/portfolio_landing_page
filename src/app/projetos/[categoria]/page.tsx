import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  categoriesData,
  getCategoryBySlug,
  getProjectsByCategory,
  profileData,
} from "@/data/portfolio";
import { ArrowLeft, ArrowUpRight, FolderGit2 } from "lucide-react";
import { FooterEditorial } from "@/components/footer-editorial";
import { GlobalDotBackground } from "@/components/ui/global-dot-background";
import { CategoryProjectList } from "@/components/category-project-list";
import { CategoryFilterDropdown } from "@/components/category-filter-dropdown";

type Props = {
  params: Promise<{ categoria: string }>;
};

export function generateStaticParams() {
  return categoriesData.map((cat) => ({
    categoria: cat.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    return {
      title: "Projetos Selecionados — Portfólio",
    };
  }

  return {
    title: `${category.title} — ${profileData.name}`,
    description: category.description,
  };
}

export default async function CategoryProjectsPage({ params }: Props) {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    notFound();
  }

  const projects = getProjectsByCategory(category.slug);

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
        opacity={0.5}
      />

      {/* Barra Superior com Link de Retorno */}
      <div className="w-full border-b border-neutral-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-600 hover:text-neutral-950 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar ao portfólio</span>
          </Link>

          <Link
            href="/#projetos"
            className="text-[12px] font-medium text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Ver todos os projetos na Home
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="w-full max-w-6xl mx-auto relative min-h-[calc(100vh-60px)] px-6 sm:px-10 lg:px-14 py-12" style={{ zIndex: 1 }}>

        {/* =========================================================================
            CABEÇALHO EDITORIAL DA CATEGORIA + BOTÃO DE FILTRO NA MESMA LINHA
           ========================================================================= */}
        <div className="pb-8 border-b border-neutral-200/80 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono text-neutral-600 w-fit">
              <span>Coleção</span>
              <span>·</span>
              <span className="font-semibold text-neutral-900">{category.name}</span>
            </div>

            {/* Botão de Filtro de Categorias Expandível com Transição Suave */}
            <CategoryFilterDropdown
              categories={categoriesData}
              currentCategorySlug={category.slug}
              projectCounts={categoriesData.reduce((acc, cat) => {
                acc[cat.slug] = getProjectsByCategory(cat.slug).length;
                return acc;
              }, {} as Record<string, number>)}
            />
          </div>

          <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] text-neutral-950 font-normal tracking-tight leading-tight">
            {category.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-3">
            <p className="text-[14px] sm:text-[15px] text-neutral-600 leading-relaxed max-w-2xl">
              {category.description}
            </p>

            <div className="flex items-center gap-2 text-[12px] text-neutral-400 font-mono shrink-0">
              <span>{projects.length} {projects.length === 1 ? "projeto listado" : "projetos listados"}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            GRADE DE PROJETOS EM 3 COLUNAS (FULL-WIDTH, SEM SIDEBAR)
           ========================================================================= */}
        <div className="w-full">
          {projects.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 border border-dashed border-neutral-200 rounded-2xl">
              <p>Nenhum projeto encontrado nesta categoria no momento.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-neutral-900 underline font-medium text-sm"
              >
                Ver todos os projetos na página inicial
              </Link>
            </div>
          ) : (
            <CategoryProjectList projects={projects} />
          )}

          {/* Rodapé da Listagem */}
          <div className="mt-14 p-8 rounded-2xl bg-neutral-100/70 border border-neutral-200/80 text-center flex flex-col items-center">
            <h3 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
              Projetos Selecionados
            </h3>
            <p className="text-[13px] text-neutral-600 mt-1.5 max-w-md">
              Trabalhos focados em precisão técnica, experiência do usuário e conversão estratégica.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-900 hover:text-neutral-700 bg-white border border-neutral-200 px-5 py-2.5 rounded-full transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ArrowLeft size={13} />
              <span>Voltar à página inicial</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Editorial Escuro Unificado */}
      <FooterEditorial />
    </div>
  );
}
