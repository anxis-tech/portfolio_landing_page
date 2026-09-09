import React from "react";
import { profileData } from "@/data/portfolio";

export function FooterEditorial() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0C0C0D] text-white py-16 sm:py-20 px-4 border-t border-neutral-900">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Monograma / Identidade Visual Centralizada */}
        <div className="mb-6 w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-white"
          >
            <path d="M16 18l6-6-6-6" />
            <path d="M8 6l-6 6 6 6" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {/* Mensagem Editorial Autoral (Idêntica à referência visual) */}
        <p className="font-serif-editorial text-2xl sm:text-3xl text-neutral-200 tracking-tight font-normal">
          {profileData.footerQuote.primary}
        </p>
        <p className="font-serif-editorial text-xl sm:text-2xl text-neutral-400 italic tracking-tight font-normal mt-0.5">
          {profileData.footerQuote.secondary}
        </p>

        {/* Linha de Copyright e Créditos */}
        <div className="mt-10 pt-6 border-t border-neutral-900/80 w-full max-w-xs flex flex-col items-center gap-1 text-[11px] font-mono text-neutral-500">
          <span>© {currentYear} {profileData.name}</span>
          <span className="text-neutral-400">Trabalhos Selecionados · UI/UX & Código</span>
        </div>
      </div>
    </footer>
  );
}
