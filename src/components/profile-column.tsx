"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  ExternalLink,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Code2,
} from "lucide-react";
import {
  profileData,
  specialtiesData,
  technologiesData,
} from "@/data/portfolio";

export function ProfileColumn() {
  return (
    <aside className="w-full bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative text-[#191919]">
      {/* 1. Avatar (Overlapping banner) */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="relative -mt-16 sm:-mt-20 mb-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#141414] group">
            <Image
              src={profileData.avatarUrl}
              alt={profileData.name}
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          {/* Active status dot */}
          <span
            className="absolute bottom-1 right-1 w-5 h-5 bg-[#00D084] border-2 border-white rounded-full"
            title="Disponível para projetos"
          />
        </div>

        {/* 2. Name & Role */}
        <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#191919] leading-snug">
          {profileData.name}
        </h1>

        <p className="text-sm font-semibold text-[#696969] mt-0.5">
          {profileData.role}
        </p>

        {/* Location & Status */}
        <div className="flex items-center text-xs text-[#696969] mt-2 gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#959595]" />
          <span>{profileData.location}</span>
          <span className="text-[#D1D5DB]">•</span>
          <span className="text-[#00A86B] font-bold">Disponível</span>
        </div>
      </div>

      {/* 3. Primary CTA Button (99Freelas) */}
      <div className="mt-5 pb-6 border-b border-[#EAEAEA]">
        <a
          href={profileData.freelasUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-full font-bold text-xs sm:text-sm bg-[#0057FF] hover:bg-[#0045CC] text-white shadow-sm transition-all duration-150 flex items-center justify-center space-x-2 text-center"
        >
          <Briefcase className="w-4 h-4" />
          <span>Contratar no 99Freelas</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/80" />
        </a>
      </div>

      {/* 4. Professional Details */}
      <div className="py-4 border-b border-[#EAEAEA] space-y-3 text-xs">
        <div className="flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-[#0057FF] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#959595] text-[11px] block">Foco Principal</span>
            <span className="font-semibold text-[#191919]">{profileData.specialty}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#959595] text-[11px] block">Disponibilidade</span>
            <span className="font-semibold text-[#191919]">{profileData.availability}</span>
          </div>
        </div>
      </div>

      {/* 5. Bio / Apresentação */}
      <div id="sobre" className="py-4 border-b border-[#EAEAEA] space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#959595]">
          SOBRE O PROFISSIONAL
        </span>
        <p className="text-xs text-[#4B5563] leading-relaxed">
          {profileData.bio}
        </p>
      </div>

      {/* 6. Especialidades */}
      <div id="especialidades" className="py-4 border-b border-[#EAEAEA] space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#959595]">
          ESPECIALIDADES
        </span>
        <ul className="space-y-1.5 text-xs text-[#4B5563]">
          {specialtiesData.map((spec) => (
            <li key={spec} className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF]" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Tecnologias */}
      <div className="py-4 space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#959595]">
          TECNOLOGIAS & FERRAMENTAS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {technologiesData.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
