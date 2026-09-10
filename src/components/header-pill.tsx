"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export function HeaderPill() {
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ["inicio", "numeros", "projetos", "parcerias", "servicos", "sobre"];
      const current = sections.find((section) => {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 160 && rect.bottom >= 160;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Início", href: "#inicio", id: "inicio" },
    { label: "Projetos", href: "#projetos", id: "projetos" },
    { label: "Parcerias", href: "#parcerias", id: "parcerias" },
    { label: "Serviços", href: "#servicos", id: "servicos" },
  ];

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Navegação Principal"
        className={`pointer-events-auto transition-all duration-300 rounded-full border border-neutral-200/80 bg-white/90 backdrop-blur-md px-2 py-1.5 flex items-center gap-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)] ${
          isScrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-neutral-300/80" : ""
        }`}
      >
        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full ${
                  isActive
                    ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Mobile menu trigger */}
        <div className="sm:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-600 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* CTA "Ver projetos" Pill com cor primária de destaque (#d8ff7c) */}
        <a
          href="#projetos"
          className="ml-1 sm:ml-2 inline-flex items-center gap-1.5 bg-[#d8ff7c] text-neutral-950 hover:bg-[#cbf765] border border-black/10 text-[12px] font-semibold tracking-tight px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 group shadow-2xs"
        >
          <span>Ver projetos</span>
          <ArrowUpRight size={13} className="text-neutral-800 group-hover:text-neutral-950 transition-colors" />
        </a>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden pointer-events-auto absolute top-16 inset-x-4 max-w-xs mx-auto bg-white/95 backdrop-blur-lg border border-neutral-200 rounded-2xl p-2 shadow-xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
