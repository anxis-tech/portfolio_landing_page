"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Globe } from "lucide-react";
import { Project } from "@/data/portfolio";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Ensure the top browser bar URL always displays with https://
  const displayUrl = project.projectUrl.startsWith("http://")
    ? project.projectUrl.replace("http://", "https://")
    : project.projectUrl.startsWith("https://")
    ? project.projectUrl
    : `https://${project.projectUrl}`;

  return (
    <article className="group bg-[#FFFFFF] border border-[#E7E1DB] rounded-2xl overflow-hidden shadow-xs hover:border-[#C96A4A]/40 transition-all duration-300 flex flex-col">
      {/* Minimalist Browser Frame Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F7F4F0] border-b border-[#E7E1DB]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E7E1DB] group-hover:bg-red-400/70 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E7E1DB] group-hover:bg-amber-400/70 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E7E1DB] group-hover:bg-emerald-400/70 transition-colors" />
        </div>
        <a
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-3 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E7E1DB] hover:border-[#C96A4A] text-[10px] text-[#73706C] hover:text-[#C96A4A] transition-colors font-mono"
        >
          <Globe className="w-3 h-3 text-[#73706C]" />
          <span className="truncate max-w-[180px] sm:max-w-[240px]">
            {displayUrl}
          </span>
        </a>
        <span className="text-[11px] font-semibold text-[#73706C] font-mono">
          {project.year}
        </span>
      </div>

      {/* Main Image Container - Smooth Full Page Scroll on Hover */}
      <a
        href={project.projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full aspect-16/10 overflow-hidden bg-[#F7F4F0] block group/image cursor-pointer"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          unoptimized
          quality={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          className="object-cover object-top group-hover/image:object-bottom transition-all duration-[7s] ease-in-out"
        />
        <div className="absolute inset-0 bg-[#252525]/0 group-hover/image:bg-[#252525]/5 transition-colors duration-300" />
      </a>

      {/* Project Info Section */}
      <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Meta Header: Category & Year */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C96A4A]">
              {project.category}
            </span>
            <span className="text-xs font-medium text-[#73706C] border border-[#E7E1DB] px-2.5 py-0.5 rounded-full">
              {project.year}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold tracking-tight text-[#252525] group-hover:text-[#C96A4A] transition-colors duration-200">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#73706C] leading-relaxed font-normal">
            {project.description}
          </p>

          {/* Technologies List */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#73706C] uppercase tracking-wider mr-1">
              Tech:
            </span>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs text-[#252525] bg-[#F7F4F0] border border-[#E7E1DB] px-2.5 py-1 rounded-md font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-[#E7E1DB] flex flex-wrap items-center gap-4 mt-auto">
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#252525] hover:text-[#C96A4A] transition-colors group/link"
          >
            <span>Ver projeto</span>
            <ArrowUpRight className="w-4 h-4 text-[#C96A4A] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>

          {project.caseStudyUrl && (
            <a
              href={project.caseStudyUrl}
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#73706C] hover:text-[#252525] transition-colors"
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
