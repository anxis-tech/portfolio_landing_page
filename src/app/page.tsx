import React from "react";
import { HeaderPill } from "@/components/header-pill";
import { HeroEditorial } from "@/components/hero-editorial";
import { RecentProjects } from "@/components/recent-projects";
import { AgencyCarousel } from "@/components/agency-carousel";
import { IntegrationsShowcase } from "@/components/integrations-showcase";
import { FooterEditorial } from "@/components/footer-editorial";
import { ServicesProcess } from "@/components/services-process";
import { GlobalDotBackground } from "@/components/ui/global-dot-background";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] flex flex-col items-center selection:bg-[#d8ff7c] selection:text-neutral-950">
      {/* Fundo Interativo Global com Dots Reactivos ao Cursor */}
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

      {/* 1. Navegação Flutuante em Cápsula (Pill Navigation) */}
      <HeaderPill />

      {/* Hero Autoral com Vitrine Bleeding na Direita */}
      <div className="w-full relative overflow-x-clip" style={{ zIndex: 1 }}>
        <HeroEditorial />
      </div>

      {/* 
        2. Coluna Central Fluida e Orgânica para as demais seções
      */}
      <main className="w-full max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>
        {/* Sites Institucionais, Sistemas Web, E-commerce e Landing Pages */}
        <RecentProjects />

        {/* Seção 'Integrações' */}
        <IntegrationsShowcase />

        {/* Serviços orientados a resultado + processo de trabalho */}
        <ServicesProcess />

        {/* Projetos em Parceria com Agências (Carrossel 2 no desktop / 1 no mobile) */}
        <AgencyCarousel />
      </main>

      {/* 3. Footer de Alto Contraste Escuro com Mensagem Autoral */}
      <FooterEditorial />
    </div>
  );
}
