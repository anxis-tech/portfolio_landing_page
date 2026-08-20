"use client";

import React from "react";
import { ExternalLink, Briefcase } from "lucide-react";
import { profileData } from "@/data/portfolio";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#141414] text-white border-b border-[#2B2B2B]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand Identity */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0057FF]" />
            <span className="text-sm sm:text-base font-extrabold tracking-wider uppercase font-sans">
              {profileData.name}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-medium text-[#959595] border-l border-[#333] pl-2.5">
              {profileData.role}
            </span>
          </a>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-semibold text-[#A3A3A3]">
          <a
            href="#projetos"
            className="hover:text-white transition-colors"
          >
            Projetos
          </a>
          <a
            href="#sobre"
            className="hover:text-white transition-colors"
          >
            Sobre
          </a>
          <a
            href="#especialidades"
            className="hover:text-white transition-colors"
          >
            Especialidades
          </a>
        </nav>

        {/* Right Side: Functional 99Freelas CTA */}
        <div className="flex items-center space-x-3">
          <a
            href={profileData.freelasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-full bg-[#0057FF] hover:bg-[#0045CC] text-white text-xs sm:text-sm font-bold tracking-tight transition-all duration-150 shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Perfil no 99Freelas</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </a>
        </div>
      </div>
    </header>
  );
}
