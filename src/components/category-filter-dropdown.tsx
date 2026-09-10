"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { ProjectCategory } from "@/data/portfolio";

interface CategoryFilterDropdownProps {
  categories: ProjectCategory[];
  currentCategorySlug: string;
  projectCounts: Record<string, number>;
}

export function CategoryFilterDropdown({
  categories,
  currentCategorySlug,
  projectCounts,
}: CategoryFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentCategory = categories.find((c) => c.slug === currentCategorySlug);

  return (
    <div className="relative inline-block text-left">
      {/* Botão de Filtro de Categorias */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-200 shadow-2xs active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
            : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
        }`}
      >
        <SlidersHorizontal size={13} className={isOpen ? "text-[#d8ff7c]" : "text-neutral-500"} />
        <span>Filtrar categoria:</span>
        <span className="font-semibold underline decoration-neutral-300 underline-offset-2">
          {currentCategory?.name || "Todas"}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 text-neutral-400 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Dropdown com Animação Suave */}
      <div
        className={`absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-neutral-200/90 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.12)] z-30 transition-all duration-200 origin-top-left ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto visible"
            : "opacity-0 scale-95 pointer-events-none invisible"
        }`}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold border-b border-neutral-100 mb-1">
          Selecionar Categoria
        </div>

        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const isCurrent = cat.slug === currentCategorySlug;
            const count = projectCounts[cat.slug] ?? 0;

            return (
              <Link
                key={cat.slug}
                href={`/projetos/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                  isCurrent
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrent ? (
                    <Check size={13} className="text-[#d8ff7c]" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isCurrent
                      ? "bg-neutral-800 text-neutral-200"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
