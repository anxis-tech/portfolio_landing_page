"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function FreelasFloatingCTA() {
  const pathname = usePathname();
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.self !== window.top) {
        setIsFramed(true);
      }
    } catch {
      setIsFramed(true);
    }
  }, []);

  if (
    isFramed ||
    (pathname && (pathname.startsWith("/drexgames-admin")))
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Contratação via 99Freelas"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden select-none max-w-[calc(100vw-2.5rem)]"
    >
      <a
        href="https://www.99freelas.com.br/user/anxis"
        target="_blank"
        rel="noopener noreferrer"
        title="Me contrate para seu projeto no 99Freelas (+85 avaliações 5 estrelas)"
        aria-label="Me contrate para seu projeto no 99Freelas (abre em nova guia)"
        className="group relative flex items-center gap-2.5 sm:gap-3 cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none"
      >
        {/* Balão de Mensagem Branco com Exibição Somente no Hover */}
        <div className="relative opacity-0 pointer-events-none scale-95 translate-x-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 ease-out origin-right">
          <div className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white border border-neutral-200/90 text-neutral-800 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] group-hover:shadow-[0_12px_28px_-4px_rgba(0,173,239,0.22),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200">
            {/* Conteúdo do Balão: Texto + Seta */}
            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <span className="text-[12.5px] sm:text-[13px] font-medium tracking-tight text-neutral-800 group-hover:text-neutral-950 transition-colors whitespace-nowrap">
                Me contrate para seu projeto
              </span>
              <span className="text-[#00adef] group-hover:text-[#0090c7] transition-colors shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>

            {/* Rabicho do Balão de Mensagem (Tail apontando para a logo) */}
            <div
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-white border-t border-r border-neutral-200/90"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Logo Flutuante (Somente o Ícone Oficial com Bolinha Verde de Usuário Ativo) */}
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 transition-all duration-200 group-hover:scale-110 group-active:scale-95 shrink-0 drop-shadow-[0_4px_12px_rgba(0,173,239,0.35)] group-hover:drop-shadow-[0_6px_20px_rgba(0,173,239,0.55)]">
          {/* Ícone Oficial do 99Freelas */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 overflow-hidden rounded-xl">
            <Image
              src="/badges/99freelas-icon.png"
              alt="99Freelas"
              width={48}
              height={48}
              className="w-full h-full object-contain transition-transform duration-200"
            />
          </div>

          {/* Bolinha Verde que Simula Usuário Ativo (Online / Disponível) */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs" />
          </span>
        </div>
      </a>
    </aside>
  );
}
