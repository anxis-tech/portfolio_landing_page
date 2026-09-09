import React from "react";
import { HeaderPill } from "@/components/header-pill";
import { HeroEditorial } from "@/components/hero-editorial";
import { RecentProjects } from "@/components/recent-projects";
import { AgencyCarousel } from "@/components/agency-carousel";
import { ServicesHelp } from "@/components/services-help";
import { FooterEditorial } from "@/components/footer-editorial";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#121212] flex flex-col items-center selection:bg-neutral-900 selection:text-white">
      {/* 1. Navegação Flutuante em Cápsula (Pill Navigation) */}
      <HeaderPill />

      {/* 
        2. Coluna Central Editorial com Linhas de Grid Arquitetônicas
        Inspirado diretamente na composição, proporções e grid vertical da imagem de referência.
      */}
      <main className="w-full max-w-6xl mx-auto border-x border-neutral-200/80 bg-[#FAFAFA] relative">
        {/* Hero Autoral com Social Proof e Métricas Sutis */}
        <HeroEditorial />

        {/* Trabalhos Recentes (3 Iniciais + Expansão 'Ver mais') */}
        <RecentProjects />

        {/* Projetos em Parceria com Agências (Carrossel 2 no desktop / 1 no mobile) */}
        <AgencyCarousel />

        {/* Seção 'Como posso ajudar' & Convite para Contato */}
        <ServicesHelp />
      </main>

      {/* 3. Footer de Alto Contraste Escuro com Mensagem Autoral */}
      <FooterEditorial />
    </div>
  );
}
