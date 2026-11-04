"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function HostingerBadge() {
  const pathname = usePathname();
  const [isFramed, setIsFramed] = useState(false);
  const [isIntersectingShowcase, setIsIntersectingShowcase] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.self !== window.top) {
        setIsFramed(true);
      }
    } catch {
      setIsFramed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target = document.getElementById("sistemas");
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        setIsIntersectingShowcase(isVisible);
      },
      {
        root: null,
        // Trigger with slight margin so it smoothly fades out before colliding with the panel
        rootMargin: "50px 0px 50px 0px",
        threshold: [0, 0.05, 0.1],
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  if (isFramed || (pathname && (pathname.startsWith("/crm") || pathname.startsWith("/drexgames-admin")))) {
    return null;
  }

  return (
    <aside
      aria-label="Parceiro Oficial Hostinger"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden transition-all duration-300 ${
        isIntersectingShowcase
          ? "opacity-0 pointer-events-none translate-y-4 scale-95"
          : "opacity-100 pointer-events-auto translate-y-0 scale-100"
      }`}
    >
      <a
        href="https://www.hostinger.com/br?REFERRALCODE=MATEUSOLIVEIRA"
        target="_blank"
        rel="noopener noreferrer"
        title="Hostinger Partner — Hospedagem de Alta Performance"
        aria-label="Hostinger Partner — Abrir link em nova guia"
        className="group block relative transition-all duration-300 hover:-translate-y-1 active:scale-95 drop-shadow-[0_4px_12px_rgba(108,43,237,0.25)] hover:drop-shadow-[0_8px_20px_rgba(108,43,237,0.4)] focus:outline-hidden focus:ring-2 focus:ring-[#6C2BED] focus:ring-offset-2 rounded-2xl"
      >
        {/* Versão Desktop: Badge Retangular (640x240) */}
        <div className="hidden sm:block">
          <Image
            src="/badges/hostinger-partner-desktop.png"
            alt="Hostinger Partner"
            width={152}
            height={57}
            className="w-[146px] h-auto select-none transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Versão Mobile: Badge Quadrada Compacta (240x240) */}
        <div className="block sm:hidden">
          <Image
            src="/badges/hostinger-partner-mobile.png"
            alt="Hostinger Partner"
            width={50}
            height={50}
            className="w-[48px] h-[48px] select-none transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </a>
    </aside>
  );
}
