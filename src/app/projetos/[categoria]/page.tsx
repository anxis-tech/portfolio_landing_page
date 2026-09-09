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
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] flex flex-col items-center selection:bg-neutral-900 selection:text-white">
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

      {/* Miolo Editorial com Sidebar à Esquerda e Grade de 2 Colunas à Direita */}
      <main className="w-full max-w-6xl mx-auto border-x border-neutral-200/80 bg-[#FAFAFA] min-h-[calc(100vh-60px)] px-6 sm:px-10 lg:px-14 py-12">
        <div className="flex flex-col md:flex-row items-start gap-10 lg:gap-14">
          
          {/* =========================================================================
              SIDEBAR VERTICAL DE FILTRAGEM (LADO ESQUERDO)
             ========================================================================= */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <FolderGit2 size={15} className="text-neutral-500" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Categorias
                </span>
              </div>

              <nav className="flex flex-col gap-1.5" aria-label="Filtro de categorias">
                {categoriesData.map((cat) => {
                  const isCurrent = cat.slug === category.slug;
                  const count = getProjectsByCategory(cat.slug).length;

                  return (
                    <Link
                      key={cat.slug}
                      href={`/projetos/${cat.slug}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${
                        isCurrent
                          ? "bg-neutral-950 text-white font-medium shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                          isCurrent
                            ? "bg-neutral-800 text-neutral-300"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                <Link
                  href="/#projetos"
                  className="text-[12px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 px-2 py-1 transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Todos os projetos</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* =========================================================================
              CONTEÚDO PRINCIPAL (GRADE DE PROJETOS EM 2 COLUNAS)
             ========================================================================= */}
          <div className="flex-1 min-w-0">
            {/* Cabeçalho Editorial da Categoria */}
            <div className="pb-8 border-b border-neutral-200/80 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono text-neutral-600 mb-3.5">
                <span>Coleção</span>
                <span>·</span>
                <span className="font-semibold text-neutral-900">{category.name}</span>
              </div>

              <h1 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] text-neutral-950 font-normal tracking-tight leading-tight">
                {category.title}
              </h1>

              <p className="text-[14px] sm:text-[15px] text-neutral-600 mt-3 leading-relaxed max-w-2xl">
                {category.description}
              </p>

              <div className="mt-4 flex items-center gap-2 text-[12px] text-neutral-400 font-mono">
                <span>{projects.length} {projects.length === 1 ? "projeto listado" : "projetos listados"}</span>
              </div>
            </div>

            {/* GRADE DE PROJETOS EM 2 COLUNAS */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    className="group flex flex-col"
                  >
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
                        sizes="(max-width: 640px) 100vw, 400px"
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
                        className="font-medium text-[15px] text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 leading-snug"
                      >
                        <span>{project.title}</span>
                      </a>
                    </div>

                    {/* Categoria / Tipo */}
                    <p className="text-[12px] text-neutral-500 mt-0.5 leading-snug">
                      {project.type || project.category}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {/* Rodapé da Listagem */}
            <div className="mt-12 p-8 rounded-2xl bg-neutral-100/70 border border-neutral-200/80 text-center flex flex-col items-center">
              <h3 className="font-serif-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
                Projetos Selecionados
              </h3>
              <p className="text-[13px] text-neutral-600 mt-1.5 max-w-md">
                Trabalhos focados em precisão técnica, experiência do usuário e conversão estratégica.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-900 hover:text-neutral-700 bg-white border border-neutral-200 px-5 py-2.5 rounded-full transition-all shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>Voltar à página inicial</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Editorial Escuro Unificado */}
      <FooterEditorial />
    </div>
  );
}
