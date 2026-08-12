import React from "react";
import { ProfileColumn } from "@/components/profile-column";
import { ProjectsColumn } from "@/components/projects-column";
import { profileData, socialLinksData } from "@/data/portfolio";
import { ExternalLink } from "lucide-react";

export default function Home() {
  const freelasLink = socialLinksData.find((item) => item.name === "99Freelas")?.url || "https://www.99freelas.com.br/user/anxis";

  return (
    <div className="relative min-h-screen bg-[#0F1115] text-[#F3F4F6] font-sans selection:bg-[#E07A5F] selection:text-[#0F1115] overflow-x-hidden">
      {/* Dark Studio Grid Background Overlay */}
      <div className="fixed inset-0 bg-dark-grid opacity-30 pointer-events-none z-0" />
      
      {/* Ambient Top Terracotta Studio Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] studio-glow pointer-events-none z-0" />

      {/* Subtle Top Editorial Utility Bar */}
      <header className="border-b border-[#272A34] bg-[#0F1115]/85 backdrop-blur-md sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#F3F4F6]">
              {profileData.name} — Web Designer & Developer
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-5 text-xs font-bold text-[#9CA3AF]">
              <a href="#sobre" className="hover:text-[#E07A5F] transition-colors">
                Sobre
              </a>
              <a href="#projetos" className="hover:text-[#E07A5F] transition-colors">
                Projetos
              </a>
            </nav>

            <a
              href={freelasLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#E07A5F] hover:bg-[#F08A6F] text-[#0F1115] text-xs font-extrabold transition-all duration-200 flex items-center space-x-1.5 shadow-sm"
            >
              <span>99Freelas</span>
              <ExternalLink className="w-3 h-3 text-[#0F1115]" />
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
