"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { profileData } from "@/data/portfolio";
import { ArrowUpRight, Sparkles, Star, FolderGit2, Clock } from "lucide-react";

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
    <section id="inicio" className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-6 sm:px-10 lg:px-14">
      {/* 1. Monograma / Identidade Visual Autoral */}
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
            <path d="M16 18l6-6-6-6" />
            <path d="M8 6l-6 6 6 6" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 2. Headline Editorial e Apresentação Autoral com Efeito de Digitação */}
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

      {/* 3. CTA em Cápsula Composta (Sem quebra de linha no mobile) */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center items-start gap-3">
        <div className="inline-flex items-center p-1 bg-neutral-100/90 border border-neutral-200/80 rounded-full shadow-2xs max-w-full">
          {/* Botão de Navegação para Projetos */}
          <a
            href="#projetos"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-950 text-white hover:bg-neutral-800 text-[12px] sm:text-[13px] font-medium px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 group active:scale-98 whitespace-nowrap shrink-0"
          >
            <span>Ver projetos</span>
            <ArrowUpRight size={13} className="text-neutral-400 group-hover:text-white transition-colors shrink-0" />
          </a>

          {/* Badge de Disponibilidade com Indicador Pulsante */}
          <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] font-medium text-neutral-600 whitespace-nowrap shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{profileData.availabilityText}</span>
          </div>
        </div>

        {/* Informação Contextual Suplementar */}
        <span className="text-[12px] text-neutral-500 flex items-center gap-1.5 pl-1 whitespace-nowrap">
          <Sparkles size={13} className="text-neutral-400 shrink-0" />
          <span>Projetos freelance & parcerias</span>
        </span>
      </div>

      {/* 4. Social Proof & Métricas Sutis Abaixo do CTA */}
      <div className="mt-10 pt-7 border-t border-neutral-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8">
        {/* Bloco 1: Avaliação 99Freelas com Avatares e Círculo com 78 */}
        <div className="flex flex-col gap-2">
          {/* Linha 1: +78 avaliações no [Badge Azul Oficial 99Freelas Clicável] + 5 estrelas */}
          <div className="flex items-center gap-2 text-[13px] text-neutral-600 flex-wrap">
            <span className="font-medium text-neutral-700">+78 avaliações no</span>
            <a
              href="https://www.99freelas.com.br/user/anxis"
              target="_blank"
              rel="noopener noreferrer"
              title="Ver perfil oficial de Mateus Oliveira no 99Freelas"
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00adef] shadow-2xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Image
                src="/badges/99freelas-logo.png"
                alt="99Freelas"
                width={76}
                height={21}
                priority
                className="h-[15px] w-auto object-contain align-middle"
              />
            </a>
            <a
              href="https://www.99freelas.com.br/user/anxis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-amber-400 ml-0.5 hover:scale-105 transition-transform"
              aria-label="5 de 5 estrelas no 99Freelas"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </a>
          </div>

          {/* Linha 2: Seta ⤷ + 5.0 + Avatares sobrepostos + Círculo 78 com Link */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.99freelas.com.br/user/anxis"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[15px] font-bold text-neutral-950 font-mono tracking-tight hover:text-neutral-700 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6v5a4 4 0 0 0 4 4h9" />
                <polyline points="14 12 18 15 14 18" />
              </svg>
              <span>5.0</span>
            </a>

            {/* Avatares de clientes sobrepostos */}
            <div className="flex items-center -space-x-2 py-0.5">
              <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                <Image src="/avatars/client-1.jpg" alt="Cliente 99Freelas" fill sizes="28px" className="object-cover" />
              </div>
              <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                <Image src="/avatars/client-2.jpg" alt="Cliente 99Freelas" fill sizes="28px" className="object-cover" />
              </div>
              <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                <Image src="/avatars/client-3.jpg" alt="Cliente 99Freelas" fill sizes="28px" className="object-cover" />
              </div>
              <div className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                <Image src="/avatars/client-4.jpg" alt="Cliente 99Freelas" fill sizes="28px" className="object-cover" />
              </div>
              {/* Círculo com o número total de avaliações: 78 */}
              <a
                href="https://www.99freelas.com.br/user/anxis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full border-2 border-white bg-neutral-900 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-2xs hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Ver 78 avaliações no 99Freelas"
              >
                78
              </a>
            </div>
          </div>
        </div>

        {/* Divisor sutil no desktop */}
        <div className="hidden md:block w-px h-10 bg-neutral-200/80" />

        {/* Bloco 2: Projetos Entregues Sutil */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center text-neutral-800 shrink-0">
            <FolderGit2 size={16} className="text-neutral-700" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif-editorial text-2xl lg:text-[26px] text-neutral-950 font-normal leading-none">
                +100
              </span>
              <span className="text-[12px] font-medium text-neutral-800">
                Projetos entregues
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Landing pages, plataformas & sistemas
            </p>
          </div>
        </div>

        {/* Divisor sutil no desktop */}
        <div className="hidden md:block w-px h-10 bg-neutral-200/80" />

        {/* Bloco 3: Anos de Experiência Sutil */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center text-neutral-800 shrink-0">
            <Clock size={16} className="text-neutral-700" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif-editorial text-2xl lg:text-[26px] text-neutral-950 font-normal leading-none">
                +4
              </span>
              <span className="text-[12px] font-medium text-neutral-800">
                Anos de experiência
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Projetando e codificando interfaces
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
