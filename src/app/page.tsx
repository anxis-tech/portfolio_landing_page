"use client";

import React from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { ProfileColumn } from "@/components/profile-column";
import { ProjectsColumn } from "@/components/projects-column";
import { profileData } from "@/data/portfolio";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#191919] font-sans selection:bg-[#0057FF] selection:text-white">
      {/* 1. Top Navigation Header */}
      <Header />

      {/* 2. Panoramic Hero Banner (High-Res 4K Studio Image) */}
      <div className="w-full relative h-48 sm:h-64 md:h-80 lg:h-[340px] xl:h-[380px] bg-[#111317] overflow-hidden">
        <Image
          src={profileData.bannerUrl}
          alt="Studio Header Banner"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center select-none"
        />
        {/* Subtle bottom gradient overlay for seamless contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* 3. Main Content: Two-Column Profile & Projects Grid */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Profile Card (Sticky on Desktop) */}
          <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-20 z-10">
            <ProfileColumn />
          </div>

          {/* Right Column: Projects Grid Showcase */}
          <div className="w-full flex-1 min-w-0 pt-2 lg:pt-4">
            <ProjectsColumn />
          </div>

        </div>
      </div>
    </div>
  );
}
