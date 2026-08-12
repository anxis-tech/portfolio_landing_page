import React from "react";
import { ProfileColumn } from "@/components/profile-column";
import { ProjectsColumn } from "@/components/projects-column";
import { profileData, socialLinksData } from "@/data/portfolio";
import { ExternalLink } from "lucide-react";

export default function Home() {
  const freelasLink = socialLinksData.find((item) => item.name === "99Freelas")?.url || "https://www.99freelas.com.br/user/anxis";

  return (
    <div className="relative min-h-screen bg-[#F7F4F0] text-[#252525] font-sans selection:bg-[#C96A4A] selection:text-[#FFFFFF] overflow-x-hidden">
      {/* Subtle Web Designer Dot-Grid Background Overlay */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none z-0" />
      
      {/* Ambient Top Editorial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] editorial-glow pointer-events-none z-0" />

      {/* Subtle Top Editorial Utility Bar */}
      <header className="border-b border-[#E7E1DB] bg-[#F7F4F0]/90 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C96A4A] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#252525]">
              {profileData.name} — Web Designer & Developer
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-5 text-xs font-semibold text-[#73706C]">
              <a href="#sobre" className="hover:text-[#C96A4A] transition-colors">
                Sobre
              </a>
              <a href="#projetos" className="hover:text-[#C96A4A] transition-colors">
                Projetos
              </a>
            </nav>

            <a
              href={freelasLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#C96A4A] hover:bg-[#B25638] text-[#FFFFFF] text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 shadow-2xs hover:shadow-xs"
            >
              <span>99Freelas</span>
              <ExternalLink className="w-3 h-3 text-[#FFFFFF]" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container: 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (35% Desktop / Sticky) */}
          <div id="sobre" className="w-full lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
            <ProfileColumn />
          </div>

          {/* Right Column (65% Desktop / Scrollable Projects Grid 2/2) */}
          <div id="projetos" className="w-full lg:col-span-8">
            <ProjectsColumn />
          </div>

        </div>
      </div>
    </div>
  );
}
