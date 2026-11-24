"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { profileData, getAllProjects } from "@/data/portfolio";
import { getProjectImage } from "@/lib/project-image";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Star, FolderGit2, Clock } from "lucide-react";

export function HeroEditorial() {
  const fullText = `${profileData.headlinePrefix} ${profileData.name}.`;
  const prefix = `${profileData.headlinePrefix} `;

  const [displayText, setDisplayText] = useState(fullText);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: NodeJS.Timeout;

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        } else {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 2600);
          return;
        }
      } else {
        if (displayText.length > prefix.length) {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        } else {
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
  }, [displayText, isDeleting, fullText, prefix.length]);

  const allProjects = getAllProjects();

  // Distribuímos 8 projetos variados por coluna para garantir que a coluna ultrapasse
  // com folga a altura máxima do container (600px), sem deixar vãos inferiores no carregamento
  const p1 = [allProjects[0], allProjects[3], allProjects[6], allProjects[9], allProjects[12], allProjects[1], allProjects[4], allProjects[7]].filter(Boolean);
  const p2 = [allProjects[2], allProjects[5], allProjects[8], allProjects[11], allProjects[13], allProjects[3], allProjects[6], allProjects[10]].filter(Boolean);
  const p3 = [allProjects[1], allProjects[4], allProjects[7], allProjects[10], allProjects[0], allProjects[2], allProjects[5], allProjects[8]].filter(Boolean);

  // Duplicamos cada bloco para um ciclo infinito, contínuo e perfeito sem reset visível
  const col1 = [...p1, ...p1];
  const col2 = [...p2, ...p2];
  const col3 = [...p3, ...p3];

  return (
    <section id="inicio" className="pt-24 sm:pt-32 pb-14 w-full overflow-x-clip">
      {/* =========================================================================
          HERO 50/50: Texto Editorial à Esquerda + 3 Colunas Grudadas na Borda Direita
         ========================================================================= */}
      <div className="w-full pl-6 sm:pl-10 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))] pr-6 sm:pr-10 lg:pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* COLUNA ESQUERDA: IDENTIDADE, TEXTO AUTORAL ORIGINAL, CTA E SOCIAL PROOF */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center z-10 max-w-2xl">
            {/* 1. Monograma / Identidade Visual Autoral */}
            <div className="mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-950 flex items-center justify-center text-white shadow-xs group hover:scale-105 transition-transform duration-300">
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
            <h1 className="font-serif-editorial text-[26px] xs:text-[30px] sm:text-[36px] lg:text-[36px] xl:text-[40px] leading-[1.15] text-neutral-950 tracking-[-0.025em] font-normal mb-3 min-h-[1.25em] whitespace-nowrap overflow-visible">
              {displayText.length <= prefix.length ? (
                <span className="whitespace-pre">{displayText}</span>
              ) : (
                <span className="whitespace-nowrap inline-flex items-center">
                  <span className="whitespace-pre">{prefix}</span>
                  <span className="font-semibold text-neutral-950">
                    {displayText.slice(prefix.length)}
                  </span>
                </span>
              )}
              <span
                className="inline-block w-[3px] h-[0.82em] bg-neutral-900 ml-1.5 align-middle animate-pulse shrink-0"
                aria-hidden="true"
              />
            </h1>

            <p className="font-serif-editorial text-base sm:text-lg lg:text-[19px] leading-[1.3] text-neutral-800 tracking-[-0.015em] font-normal">
              Desenvolvedor e <span className="italic font-medium text-neutral-950">UI/UX Designer</span> criando experiências digitais funcionais, estratégicas e visualmente refinadas.
            </p>

            <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-neutral-500 leading-relaxed">
              Sites, landing pages e sistemas sob medida que transmitem confiança e transformam visitantes em clientes, para marcas, criadores e agências.
            </p>

            {/* 3. Linha do CTA + Widget 99Freelas ao Lado (Sem fundo/borda, avatares abaixo do texto, 1 estrela no 5.0) */}
            <div className="mt-6 flex items-center gap-4 sm:gap-6 flex-wrap">
              {/* Botão CTA Principal */}
              <div className="popout-btn-container hero-cta-primary shrink-0">
                <div className="popout-btn-drawer popout-transition-top" aria-hidden="true">
                  cases selecionados...
                </div>

                <div className="popout-btn-drawer popout-transition-bottom" aria-hidden="true">
                  ...rolar para ver ↓
                </div>

                <a
                  href="#projetos"
                  className="popout-btn group"
                  aria-label="Navegar até a seção de projetos selecionados"
                >
                  <span className="popout-btn-text">
                    Ver projetos
                  </span>
                </a>
              </div>

              {/* Widget 99Freelas Posicionado ao Lado do CTA (Sem fundo/borda, tamanho proporcional e legível) */}
              <div className="flex flex-col gap-1.5 sm:gap-2 justify-center">
                {/* Linha 1: Texto + Badge 99Freelas Oficial */}
                <div className="flex items-center gap-2 text-[14px] sm:text-[14.5px] text-neutral-600">
                  <span className="font-medium text-neutral-800 whitespace-nowrap">
                    <NumberTicker value={85} prefix="+" duration={1200} /> avaliações no
                  </span>
                  <a
                    href="https://www.99freelas.com.br/user/anxis"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver perfil oficial de Mateus Oliveira no 99Freelas"
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00adef] shadow-2xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Image
                      src="/badges/99freelas-logo.png"
                      alt="99Freelas"
                      width={78}
                      height={20}
                      className="h-[15px] sm:h-[16px] w-auto object-contain align-middle"
                    />
                  </a>
                </div>

                {/* Linha 2 (Abaixo do Texto): 1 Estrela + 5.0 + Avatares Sobrepostos Ampliados */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <a
                    href="https://www.99freelas.com.br/user/anxis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[15px] sm:text-[16px] font-bold text-neutral-950 font-mono tracking-tight hover:text-neutral-700 transition-colors"
                  >
                    <Star size={16} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span>5.0</span>
                  </a>

                  {/* Avatares de clientes sobrepostos com tamanho aprimorado (25px) */}
                  <div className="flex items-center -space-x-1.5 py-0.5">
                    <div className="relative w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                      <Image src="/avatars/client-1.jpg" alt="Cliente 99Freelas" fill sizes="30px" className="object-cover" />
                    </div>
                    <div className="relative w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                      <Image src="/avatars/client-2.jpg" alt="Cliente 99Freelas" fill sizes="30px" className="object-cover" />
                    </div>
                    <div className="relative w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                      <Image src="/avatars/client-3.jpg" alt="Cliente 99Freelas" fill sizes="30px" className="object-cover" />
                    </div>
                    <div className="relative w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] rounded-full border-2 border-white overflow-hidden bg-neutral-200 shadow-2xs">
                      <Image src="/avatars/client-4.jpg" alt="Cliente 99Freelas" fill sizes="30px" className="object-cover" />
                    </div>
                    {/* Círculo com o número total de avaliações: 85 */}
                    <a
                      href="https://www.99freelas.com.br/user/anxis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[25px] h-[25px] sm:w-[26px] sm:h-[26px] rounded-full border-2 border-white bg-neutral-900 text-white text-[9px] sm:text-[9.5px] font-bold font-mono flex items-center justify-center shadow-2xs hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Ver 85 avaliações no 99Freelas"
                    >
                      <NumberTicker value={85} duration={1200} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Métricas Sutis Logo Abaixo */}
            <div className="mt-5 pt-4 border-t border-neutral-200/70">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bloco: Projetos Entregues */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center text-neutral-800 shrink-0">
                    <FolderGit2 size={13} className="text-neutral-700" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif-editorial text-[17px] text-neutral-950 font-normal leading-none">
                        <NumberTicker value={100} prefix="+" duration={1400} />
                      </span>
                      <span className="text-[11px] font-medium text-neutral-800">
                        Projetos entregues
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Landing pages, plataformas & sistemas
                    </p>
                  </div>
                </div>

                {/* Bloco: Anos de Experiência */}
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-100/90 border border-neutral-200/80 flex items-center justify-center text-neutral-800 shrink-0">
                    <Clock size={13} className="text-neutral-700" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif-editorial text-[17px] text-neutral-950 font-normal leading-none">
                        <NumberTicker value={4} prefix="+" duration={1000} />
                      </span>
                      <span className="text-[11px] font-medium text-neutral-800">
                        Anos de experiência
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Projetando e codificando interfaces
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: VITRINE DE 3 COLUNAS COM ALTURA PROPORCIONAL E HARMONIOSA */}
          <div className="lg:col-span-6 xl:col-span-6 relative w-full h-[460px] sm:h-[540px] lg:h-[600px] overflow-hidden select-none pointer-events-none pr-0">
            
            {/* Gradients sutis e discretos no topo e rodapé */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#FAFAFA] to-transparent z-20" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FAFAFA] to-transparent z-20" />

            {/* Grid de 3 Colunas com Imagens dos Projetos com 5px de border-radius */}
            <div className="grid grid-cols-3 gap-3 sm:gap-3.5 h-full w-full pr-0">
              
              {/* Coluna 1 (Sobe) */}
              <div className="flex flex-col gap-3 sm:gap-3.5 animate-stream-col-1">
                {col1.map((p, i) => {
                  const img = getProjectImage(p, true);
                  return (
                    <div
                      key={`${p.id}-col1-${i}`}
                      className="relative rounded-[5px] overflow-hidden border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.05)] aspect-[16/10] bg-neutral-100 shrink-0"
                    >
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 33vw, 220px"
                        className="object-cover object-top rounded-[5px]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Coluna 2 (Desce com offset) */}
              <div className="flex flex-col gap-3 sm:gap-3.5 animate-stream-col-2">
                {col2.map((p, i) => {
                  const img = getProjectImage(p, true);
                  return (
                    <div
                      key={`${p.id}-col2-${i}`}
                      className="relative rounded-[5px] overflow-hidden border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.05)] aspect-[16/10] bg-neutral-100 shrink-0"
                    >
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 33vw, 220px"
                        className="object-cover object-top rounded-[5px]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Coluna 3 (Sobe com ritmo alternado e vazando na direita) */}
              <div className="flex flex-col gap-3 sm:gap-3.5 animate-stream-col-3">
                {col3.map((p, i) => {
                  const img = getProjectImage(p, true);
                  return (
                    <div
                      key={`${p.id}-col3-${i}`}
                      className="relative rounded-[5px] overflow-hidden border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.05)] aspect-[16/10] bg-neutral-100 shrink-0"
                    >
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 33vw, 220px"
                        className="object-cover object-top rounded-[5px]"
                      />
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
