"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Gamepad2,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

export type DrexTab =
  | "dashboard"
  | "catalogo"
  | "pedidos"
  | "clientes"
  | "relatorios"
  | "cupons"
  | "integracoes";

interface SectionItem {
  id: DrexTab;
  label: string;
  icon: React.ElementType;
}

const sections: SectionItem[] = [
  { id: "dashboard", label: "Resumo", icon: LayoutDashboard },
  { id: "catalogo", label: "Catálogo", icon: LibraryBig },
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
  { id: "cupons", label: "Cupons & Descontos", icon: Ticket },
  { id: "integracoes", label: "Integrações", icon: PlugZap },
];

interface DrexAdminShellProps {
  children: React.ReactNode;
  activeTab: DrexTab;
  onSelectTab: (tab: DrexTab) => void;
  onLogout: () => void;
  userName?: string;
  isEmbedded?: boolean;
}

export function DrexAdminShell({
  children,
  activeTab,
  onSelectTab,
  onLogout,
  userName = "Mateus Oliveira",
  isEmbedded = false,
}: DrexAdminShellProps) {
  const currentSection = sections.find((s) => s.id === activeTab) || sections[0];

  return (
    <div className="admin-shell">
      {/* Sidebar Oficial DrexGames */}
      <aside className="admin-sidebar select-none">
        <div className="admin-brand">
          <Gamepad2 size={29} />
          <span>
            DREX<strong>GAMES</strong>
            <small>ADMINISTRAÇÃO</small>
          </span>
        </div>

        <span className="admin-nav-label">OPERAÇÃO</span>

        <nav className="admin-navigation" aria-label="Administração">
          {sections.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(id);
                }}
                aria-current={isActive ? "page" : undefined}
                className="cursor-pointer"
              >
                <Icon size={19} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <span>
            <ShieldCheck size={17} /> Ambiente administrativo
          </span>
          <a
            href="https://drexgames.com.br"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            Abrir loja <ArrowUpRight size={16} />
          </a>
        </div>
      </aside>

      {/* Workspace Principal */}
      <div className="admin-workspace">
        {/* Topbar Oficial DrexGames */}
        <header className="admin-topbar select-none">
          <div>
            <span>Drex Games</span>
            <span aria-hidden="true">/</span>
            <strong>{currentSection.label}</strong>
          </div>

          <div className="admin-user">
            <span className="admin-avatar" aria-hidden="true">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="admin-user-name">{userName}</span>
            <button
              type="button"
              onClick={onLogout}
              className="admin-logout cursor-pointer"
              title="Encerrar sessão administrativa"
            >
              <LogOut size={17} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Conteúdo Dinâmico da Aba Selecionada */}
        <main id="admin-content" className="admin-content">
          {children}
        </main>

        {/* Rodapé Oficial DrexGames */}
        <footer className="admin-footer select-none">
          <div>
            Drex Games <span>Administração · Consulta operacional de e-commerce</span>
          </div>
          <span>Ambiente de demonstração autêntico</span>
        </footer>
      </div>

      {/* Botão flutuante para voltar ao portfólio (apenas em visualização standalone/direta) */}
      {!isEmbedded && (
        <div className="fixed bottom-5 right-5 z-50 print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#251c34] text-white hover:bg-[#342749] px-4 py-2.5 rounded-full shadow-2xl border border-white/20 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
          >
            <span>← Voltar ao Portfólio</span>
          </Link>
        </div>
      )}
    </div>
  );
}
