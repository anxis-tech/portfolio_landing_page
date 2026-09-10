"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X, ChevronDown, FolderGit2, Sparkles } from "lucide-react";
import { getAllCategories, getProjectsByCategory, ProjectCategory, Project } from "@/data/portfolio";

export function HeaderPill() {
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);

  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>(categories[0]);

  // Timeout para fechar suavemente o megamenu com debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsProjectsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProjectsMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ["inicio", "numeros", "projetos", "parcerias", "servicos", "sobre"];
      const current = sections.find((section) => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 160 && rect.bottom >= 160;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Obter 1 projeto representativo para a categoria em foco
  const previewProjects = getProjectsByCategory(selectedCategory.slug);
  const previewProject: Project | undefined = previewProjects[0];

  return (
    <header className="fixed top-5 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Navegação Principal"
        className={`pointer-events-auto relative transition-all duration-300 rounded-full border border-neutral-200/80 bg-white/90 backdrop-blur-md px-2 py-1.5 flex items-center gap-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ${
          isScrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-neutral-300/80" : ""
        }`}
      >
        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-0.5">
          {/* Link Início */}
          <a
            href="#inicio"
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full ${
              activeSection === "inicio"
                ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            Início
          </a>

          {/* Item Projetos com Submenu / Megamenu */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsProjectsMenuOpen((prev) => !prev)}
              className={`px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full flex items-center gap-1 cursor-pointer select-none ${
                isProjectsMenuOpen || activeSection === "projetos"
                  ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
              aria-expanded={isProjectsMenuOpen}
              aria-haspopup="true"
            >
              <span>Projetos</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 text-neutral-400 ${
                  isProjectsMenuOpen ? "rotate-180 text-neutral-900" : ""
                }`}
              />
            </button>

            {/* Megamenu Dropdown Container */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-250 ease-out z-50 ${
                isProjectsMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 -translate-y-2 pointer-events-none invisible"
              }`}
            >
              <div className="w-[580px] bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] grid grid-cols-[230px_1fr] gap-4">
                {/* Coluna Esquerda: Lista de Categorias */}
                <div className="flex flex-col gap-1 pr-2 border-r border-neutral-100">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 mb-1 text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
                    <FolderGit2 size={12} />
                    <span>Categorias</span>
                  </div>

                  {categories.map((cat) => {
                    const isSelected = selectedCategory.slug === cat.slug;
                    const count = getProjectsByCategory(cat.slug).length;

                    return (
                      <Link
                        key={cat.slug}
                        href={`/projetos/${cat.slug}`}
                        onMouseEnter={() => setSelectedCategory(cat)}
                        onClick={() => setIsProjectsMenuOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                          isSelected
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-colors ${
                            isSelected
                              ? "bg-neutral-800 text-neutral-200"
                              : "bg-neutral-100 text-neutral-400 group-hover:text-neutral-600"
                          }`}
                        >
                          {count}
                        </span>
                      </Link>
                    );
                  })}

                  <div className="mt-2 pt-2 border-t border-neutral-100">
                    <Link
                      href="/#projetos"
                      onClick={() => setIsProjectsMenuOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-950 transition-colors"
                    >
                      <span>Ver todos na Home</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Coluna Direita: Preview do Projeto da Categoria em Hover */}
                <div className="flex flex-col justify-between pl-1">
                  {previewProject ? (
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        {/* Tag da categoria ativa */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            <Sparkles size={10} className="text-[#84cc16]" />
                            <span>Destaque</span>
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {previewProject.year || "2026"}
                          </span>
                        </div>

                        {/* Card com formato da grade adaptado para o megamenu */}
                        <a
                          href={previewProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/card relative aspect-[5/3] w-full overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/80 mb-2.5 block cursor-pointer"
                        >
                          <Image
                            src={previewProject.image}
                            alt={previewProject.title}
                            fill
                            unoptimized
                            sizes="280px"
                            className="object-cover object-top transition-transform duration-500 group-hover/card:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/15 transition-colors duration-200 flex items-start justify-end p-2">
                            <span className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm text-neutral-900 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-xs">
                              <ArrowUpRight size={12} />
                            </span>
                          </div>
                        </a>

                        <a
                          href={previewProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[13px] text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 leading-snug"
                        >
                          <span className="truncate">{previewProject.title}</span>
                          <ArrowUpRight size={11} className="text-neutral-400 shrink-0" />
                        </a>

                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug line-clamp-1">
                          {previewProject.type || previewProject.category}
                        </p>
                      </div>

                      {/* Botão de Ação para Explorar a Categoria Completa */}
                      <div className="pt-2.5 mt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 truncate max-w-[140px]">
                          {selectedCategory.name}
                        </span>
                        <Link
                          href={`/projetos/${selectedCategory.slug}`}
                          onClick={() => setIsProjectsMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 hover:text-neutral-600 transition-colors bg-neutral-100 hover:bg-neutral-200/70 px-2.5 py-1 rounded-full"
                        >
                          <span>Ver categoria</span>
                          <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-4 border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                      Nenhum projeto disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Link Parcerias */}
          <a
            href="#parcerias"
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full ${
              activeSection === "parcerias"
                ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            Parcerias
          </a>

          {/* Link Serviços */}
          <a
            href="#servicos"
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full ${
              activeSection === "servicos"
                ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            Serviços
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="sm:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* CTA "Ver projetos" Pill com cor primária de destaque (#d8ff7c) */}
        <a
          href="#projetos"
          className="ml-1 sm:ml-2 inline-flex items-center gap-1.5 bg-[#d8ff7c] text-neutral-950 hover:bg-[#cbf765] border border-black/10 text-[12px] font-semibold tracking-tight px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 group shadow-2xs"
        >
          <span>Ver projetos</span>
          <ArrowUpRight size={13} className="text-neutral-800 group-hover:text-neutral-950 transition-colors" />
        </a>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden pointer-events-auto absolute top-16 inset-x-4 max-w-xs mx-auto bg-white/95 backdrop-blur-lg border border-neutral-200 rounded-2xl p-3 shadow-xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          <a
            href="#inicio"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3.5 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
          >
            Início
          </a>

          {/* Submenu mobile de categorias */}
          <div className="py-1 px-1">
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Categorias de Projetos
            </div>
            <div className="flex flex-col gap-0.5 mt-1 pl-2 border-l border-neutral-100">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/projetos/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {getProjectsByCategory(cat.slug).length}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <a
            href="#parcerias"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3.5 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
          >
            Parcerias
          </a>

          <a
            href="#servicos"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3.5 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
          >
            Serviços
          </a>
        </div>
      )}
    </header>
  );
}

