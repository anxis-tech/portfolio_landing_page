"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  profileData,
  socialLinksData,
  specialtiesData,
  technologiesData,
} from "@/data/portfolio";

export function ProfileColumn() {
  const activeSocials = socialLinksData.filter((item) => item.active);

  return (
    <aside className="w-full space-y-8 bg-[#181A20] border border-[#272A34] rounded-2xl p-6 sm:p-8 shadow-xl hover:border-[#E07A5F]/40 transition-all duration-300 relative overflow-hidden studio-card-glow">
      {/* 1. Photo & Status Indicator */}
      <div className="space-y-5">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-[#272A34] ring-2 ring-[#E07A5F]/40 ring-offset-4 ring-offset-[#181A20] shadow-md group bg-[#121419]">
          <Image
            src={profileData.avatarUrl}
            alt={profileData.name}
            fill
            sizes="(max-width: 640px) 128px, 144px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>

        {/* Availability Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E07A5F]/10 border border-[#E07A5F]/30">
          <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-pulse" />
          <span className="text-[12px] font-bold text-[#E07A5F] uppercase tracking-wider">
            {profileData.availability}
          </span>
        </div>
      </div>

      {/* 2. Name & Title */}
      <div className="space-y-1.5 border-b border-[#272A34] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F3F4F6] uppercase leading-none font-sans">
          {profileData.name}
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E07A5F]">
          {profileData.role}
        </p>
      </div>

      {/* 3. Short Presentation */}
      <div className="space-y-2.5 border-b border-[#272A34] pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9CA3AF] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mr-2" />
          APRESENTAÇÃO
        </span>
        <p className="text-sm text-[#9CA3AF] leading-relaxed font-normal">
          {profileData.bio}
        </p>
      </div>

      {/* 4. Professional Information */}
      <div className="space-y-3.5 border-b border-[#272A34] pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9CA3AF] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mr-2" />
          INFORMAÇÕES
        </span>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-start space-x-3 text-[#F3F4F6]">
            <MapPin className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#9CA3AF] text-[11px]">Localização</span>
              <span className="font-semibold">{profileData.location}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-[#F3F4F6]">
            <Briefcase className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#9CA3AF] text-[11px]">Status</span>
              <span className="font-semibold">{profileData.availability}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-[#F3F4F6]">
            <Sparkles className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#9CA3AF] text-[11px]">Especialidade Principal</span>
              <span className="font-semibold">{profileData.specialty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Professional Networks */}
      <div className="space-y-3 border-b border-[#272A34] pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9CA3AF] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mr-2" />
          CONTATO & PERFIS
        </span>

        <div className="space-y-2">
          {activeSocials.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-[#272A34] bg-[#121419] hover:border-[#E07A5F] hover:bg-[#E07A5F]/10 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#181A20] border border-[#272A34] flex items-center justify-center text-[#E07A5F] group-hover:border-[#E07A5F] transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#F3F4F6] group-hover:text-[#E07A5F] transition-colors">
                    {link.name}
                  </span>
                  {link.platformBadge && (
                    <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#E07A5F]" />
                      {link.platformBadge}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#E07A5F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          ))}
        </div>
      </div>

      {/* 6. Specialties */}
      <div className="space-y-3 border-b border-[#272A34] pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9CA3AF] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mr-2" />
          ESPECIALIDADES
        </span>
        <ul className="space-y-2 text-xs">
          {specialtiesData.map((item) => (
            <li key={item} className="flex items-center space-x-2 text-[#F3F4F6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] shrink-0" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Technologies */}
      <div className="space-y-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9CA3AF] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mr-2" />
          TECNOLOGIAS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {technologiesData.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#121419] text-[#F3F4F6] border border-[#272A34] hover:border-[#E07A5F]/60 hover:text-[#E07A5F] transition-all duration-200 cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
