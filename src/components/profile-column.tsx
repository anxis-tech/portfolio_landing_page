"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Briefcase,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Send,
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
    <aside className="w-full space-y-8 bg-[#FFFFFF] border border-[#E7E1DB] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* 1. Photo & Availability Badge */}
      <div className="space-y-4">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-[#E7E1DB] shadow-xs group bg-[#F7F4F0]">
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FDF5F2] border border-[#C96A4A]/20">
          <span className="w-2 h-2 rounded-full bg-[#C96A4A] animate-pulse" />
          <span className="text-[12px] font-medium text-[#C96A4A]">
            {profileData.availability}
          </span>
        </div>
      </div>

      {/* 2. Name & Title */}
      <div className="space-y-1 border-b border-[#E7E1DB] pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#252525] uppercase leading-none font-sans">
          {profileData.name}
        </h1>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#C96A4A] pt-1">
          {profileData.role}
        </p>
      </div>

      {/* 3. Short Presentation */}
      <div className="space-y-2 border-b border-[#E7E1DB] pb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#73706C]">
          APRESENTAÇÃO
        </span>
        <p className="text-sm text-[#73706C] leading-relaxed font-normal">
          {profileData.bio}
        </p>
      </div>

      {/* 4. Professional Information */}
      <div className="space-y-3.5 border-b border-[#E7E1DB] pb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#73706C]">
          INFORMAÇÕES
        </span>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-start space-x-3 text-[#252525]">
            <MapPin className="w-4 h-4 text-[#C96A4A] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#73706C] text-[11px]">Localização</span>
              <span className="font-semibold">{profileData.location}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-[#252525]">
            <Briefcase className="w-4 h-4 text-[#C96A4A] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#73706C] text-[11px]">Disponibilidade</span>
              <span className="font-semibold">{profileData.availability}</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-[#252525]">
            <Sparkles className="w-4 h-4 text-[#C96A4A] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[#73706C] text-[11px]">Especialidade Principal</span>
              <span className="font-semibold">{profileData.specialty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Professional Networks */}
      <div className="space-y-3 border-b border-[#E7E1DB] pb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#73706C]">
          CONTATO & PERFIS
        </span>

        <div className="space-y-2">
          {activeSocials.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-[#E7E1DB] bg-[#F7F4F0] hover:border-[#C96A4A] hover:bg-[#FDF5F2] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E7E1DB] flex items-center justify-center text-[#C96A4A]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#252525] group-hover:text-[#C96A4A] transition-colors">
                    {link.name}
                  </span>
                  {link.platformBadge && (
                    <span className="text-[10px] text-[#73706C] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#C96A4A]" />
                      {link.platformBadge}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#73706C] group-hover:text-[#C96A4A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          ))}
        </div>
      </div>

      {/* 6. Specialties */}
      <div className="space-y-3 border-b border-[#E7E1DB] pb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#73706C]">
          ESPECIALIDADES
        </span>
        <ul className="space-y-2 text-xs">
          {specialtiesData.map((item) => (
            <li key={item} className="flex items-center space-x-2 text-[#252525]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C96A4A] shrink-0" />
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Technologies */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#73706C]">
          TECNOLOGIAS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {technologiesData.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F7F4F0] text-[#252525] border border-[#E7E1DB]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
