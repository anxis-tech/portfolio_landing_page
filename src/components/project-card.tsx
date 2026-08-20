"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Project } from "@/data/portfolio";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article className="group bg-white border border-[#E5E7EB] hover:border-[#0057FF]/60 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* 1. Project Cover Image */}
      <a
        href={project.projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-4/3 overflow-hidden bg-[#F3F4F6] block cursor-pointer"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          unoptimized
          quality={100}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-xs text-[#191919] font-bold text-xs shadow-md flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <span>Ver projeto ao vivo</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0057FF]" />
          </span>
        </div>

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase">
            {project.category}
          </span>
        </div>
      </a>

      {/* 2. Direct & Objective Project Info Footer */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white border-t border-[#F3F4F6]">
        <div className="min-w-0 flex-1">
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-bold text-sm text-[#191919] group-hover:text-[#0057FF] transition-colors truncate"
            title={project.title}
          >
            {project.title}
          </a>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#696969] truncate">
            <span>{project.technologies.join(" • ")}</span>
          </div>
        </div>

        {/* Action Link Icon */}
        <a
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-[#F3F4F6] group-hover:bg-[#0057FF] group-hover:text-white text-[#696969] flex items-center justify-center shrink-0 transition-colors"
          title="Abrir site"
        >
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}
