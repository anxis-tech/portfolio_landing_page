"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Globe, MousePointer } from "lucide-react";
import { Project } from "@/data/portfolio";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  // Ensure the top browser bar URL always displays with https://
  const displayUrl = project.projectUrl.startsWith("http://")
    ? project.projectUrl.replace("http://", "https://")
    : project.projectUrl.startsWith("https://")
    ? project.projectUrl
    : `https://${project.projectUrl}`;

  // Formatted project index number (01, 02, 03...)
  const projectNumber = String(index + 1).padStart(2, "0");

  return (
    <article className="group bg-[#181A20] border border-[#272A34] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:border-[#FF3366]/50 transition-all duration-300 flex flex-col relative creative-card-glow">
      {/* Minimalist Dark Studio Browser Frame Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#121419] border-b border-[#272A34]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        </div>
        
        <a
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181A20] border border-[#272A34] hover:border-[#FF3366] text-[10px] text-[#9CA3AF] hover:text-white transition-all font-mono shadow-2xs group/url"
        >
          <Globe className="w-3 h-3 text-[#FF3366] group-hover/url:text-[#FF7A00] transition-colors" />
          <span className="truncate max-w-[160px] sm:max-w-[200px]">
            {displayUrl}
          </span>
        </a>

        {/* Oversized Editorial Project Index Number */}
        <span className="text-xs font-extrabold text-gradient-creative font-mono tracking-widest px-2.5 py-0.5 rounded-md bg-[#121419] border border-[#272A34]">
          {projectNumber}
        </span>
      </div>

      {/* Main Image Container - Smooth Full Page Scroll on Hover */}
      <a
        href={project.projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-16/10 overflow-hidden bg-[#121419] block group/image cursor-pointer"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          unoptimized
          quality={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-cover object-top group-hover/image:object-bottom transition-all duration-[8s] ease-in-out"
        />
        
        {/* Subtle Dark Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-[#0F1115]/0 group-hover/image:bg-[#0F1115]/10 transition-colors duration-300 pointer-events-none" />

        {/* Hover Cue Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[#0F1115]/90 border border-[#272A34] backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center space-x-1.5 shadow-md">
          <MousePointer className="w-3 h-3 text-[#FF3366]" />
          <span className="text-gradient-creative">Role para explorar</span>
        </div>
      </a>

      {/* Project Info Section */}
      <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Meta Header: Category & Year */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gradient-creative">
              {project.category}
            </span>
            <span className="text-xs font-semibold text-[#9CA3AF] border border-[#272A34] px-2.5 py-0.5 rounded-full bg-[#121419]">
              {project.year}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-extrabold tracking-tight text-[#F3F4F6] group-hover:text-[#FF3366] transition-colors duration-200">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#9CA3AF] leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Technologies List */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mr-1">
              Tech:
            </span>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs text-[#F3F4F6] bg-[#121419] border border-[#272A34] px-2.5 py-1 rounded-md font-medium group-hover:border-[#FF3366]/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-[#272A34] flex flex-wrap items-center gap-4 mt-auto">
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#F3F4F6] hover:text-[#FF3366] transition-colors group/link"
          >
            <span>Ver projeto ao vivo</span>
            <ArrowUpRight className="w-4 h-4 text-[#FF3366] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>

          {project.caseStudyUrl && (
            <a
              href={project.caseStudyUrl}
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Estudo de caso</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
