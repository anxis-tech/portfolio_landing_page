"use client";

import React, { useState, useEffect } from "react";
import { profileData } from "@/data/portfolio";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function HeroEditorial() {
  const fullText = `${profileData.headlinePrefix} ${profileData.name}.`;
  const prefix = `${profileData.headlinePrefix} `;

  const [displayText, setDisplayText] = useState(fullText);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        } else {
          // Pausa com o texto completo digitado
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 2600);
          return;
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        } else {
          // Pausa com o texto deletado antes de recomeçar o looping
          timer = setTimeout(() => {
            setIsDeleting(false);
          }, 600);
          return;
        }
      }
    };

    const speed = isDeleting ? 38 : 75;
    timer = setTimeout(handleTyping, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, fullText]);

  return (
    <section id="inicio" className="pt-24 pb-14 sm:pt-32 sm:pb-20 px-6 sm:px-10 lg:px-14">
      {/* 1. Monograma / Identidade Visual Autoral (Inspirado no ícone do topo da referência) */}
      <div className="mb-8">
        <div className="w-11 h-11 rounded-xl bg-neutral-950 flex items-center justify-center text-white shadow-xs group hover:scale-105 transition-transform duration-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-white"
          >
            {/* Monograma geométrico de desenvolvedor + designer: grid & código */}
            <path d="M16 18l6-6-6-6" />
            <path d="M8 6l-6 6 6 6" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 2. Headline Editorial e Apresentação Autoral com Efeito de Digitação em Looping */}
      <div className="max-w-4xl">
        <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-[52px] leading-[1.15] text-neutral-950 tracking-[-0.025em] font-normal mb-4 min-h-[1.25em] flex items-center flex-wrap">
          {displayText.length <= prefix.length ? (
            <span className="whitespace-pre">{displayText}</span>
          ) : (
            <>
              <span className="whitespace-pre">{prefix}</span>
              <span className="font-semibold text-neutral-900">{displayText.slice(prefix.length)}</span>
            </>
          )}
          <span
            className="inline-block w-[3px] h-[0.82em] bg-neutral-900 ml-1.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        </h1>

        <p className="font-serif-editorial text-2xl sm:text-3xl lg:text-[38px] leading-[1.2] text-neutral-800 tracking-[-0.02em] font-normal">
          Desenvolvedor e <span className="italic font-medium text-neutral-950">UI/UX Designer</span> criando experiências digitais funcionais, estratégicas e visualmente refinadas.
        </p>

        <p className="mt-5 text-[15px] text-neutral-500 leading-relaxed max-w-2xl">
          Especializado em unir arquitetura de software front-end de alto padrão à direção visual editorial para marcas, criadores e agências.
        </p>
      </div>

      {/* 3. CTA em Cápsula Composta (Semelhante à referência visual) */}
      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center p-1 bg-neutral-100/90 border border-neutral-200/80 rounded-full shadow-2xs">
          {/* Botão de Navegação para Projetos */}
          <a
            href="#projetos"
            className="inline-flex items-center gap-2 bg-neutral-950 text-white hover:bg-neutral-800 text-[13px] font-medium px-4 py-2 rounded-full transition-all duration-200 group active:scale-98"
          >
            <span>Ver projetos</span>
            <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-white transition-colors" />
          </a>

          {/* Badge de Disponibilidade com Indicador Pulsante */}
          <div className="px-3.5 py-1.5 flex items-center gap-2 text-[12px] font-medium text-neutral-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{profileData.availabilityText}</span>
          </div>
        </div>

        {/* Informação Contextual Suplementar */}
        <span className="text-[12px] text-neutral-600 flex items-center gap-1.5 pl-1">
          <Sparkles size={13} className="text-neutral-600" />
          <span>Projetos freelance & parcerias</span>
        </span>
      </div>
    </section>
  );
}
