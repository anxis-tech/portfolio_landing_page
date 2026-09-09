import React from "react";
import { statsData } from "@/data/portfolio";
import { Star } from "lucide-react";

export function AtAGlance() {
  return (
    <section id="numeros" className="border-t border-neutral-200/80 pt-12 pb-14 px-6 sm:px-10 lg:px-14">
      {/* Rótulo da Seção */}
      <div className="mb-6">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 font-mono">
          Em números
        </span>
      </div>

      {/* Grid de 3 Colunas com Números em Destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10">
        {statsData.map((stat, idx) => (
          <div
            key={stat.id}
            className={`flex flex-col ${
              idx !== 0 ? "sm:border-l sm:border-neutral-200/70 sm:pl-8 lg:pl-10" : ""
            }`}
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl text-neutral-950 font-normal tracking-tight">
                {stat.value}
              </span>
              {stat.id === "rating" && (
                <div className="flex items-center gap-0.5 text-amber-400 mb-1" aria-label="5 de 5 estrelas">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
            </div>
            <span className="text-[13px] font-medium text-neutral-800 mt-1">
              {stat.label}
            </span>
            {stat.description && (
              <span className="text-[12px] text-neutral-600 mt-0.5 leading-snug">
                {stat.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
