"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  BookOpen,
  Settings,
  Layers,
  Filter,
  Search,
  Bot,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PlatformsSubView =
  | "platforms_opportunities"
  | "platforms_metrics"
  | "platforms_catalog"
  | "platforms_settings";

interface PlatformsTabProps {
  initialSubView?: PlatformsSubView;
  onSubViewChange?: (view: PlatformsSubView) => void;
  isDarkMode?: boolean;
}

export function PlatformsTab({
  initialSubView = "platforms_opportunities",
  onSubViewChange,
  isDarkMode = false,
}: PlatformsTabProps) {
  const [subView, setSubView] = useState<PlatformsSubView>(initialSubView);

  const changeSubView = (next: PlatformsSubView) => {
    setSubView(next);
    onSubViewChange?.(next);
  };

  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);
  const [selectedFilter, setSelectedFilter] = useState<string>("proposal");
  const [sentOpportunities, setSentOpportunities] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>("opp-1");

  const opportunities = [
    {
      id: "opp-1",
      platform: "99Freelas",
      platformBadgeColor: "bg-[#00adef]/15 text-[#0092ca] border-[#00adef]/30",
      title: "Desenvolvimento de Landing Page de Alta Conversão para Escritório Jurídico",
      client: "Marcelo Drummond (Advocacia Empresarial)",
      publishedAt: "Há 35 minutos",
      budget: "R$ 3.500,00",
      deadline: "10 a 15 dias",
      proposalsCount: 8,
      compatibilityScore: 98,
      compatibilityLevel: "Alta",
      status: sentOpportunities.includes("opp-1") ? "sent" : "proposal_ready",
      summary: "Banca jurídica especializada em direito tributário e empresarial necessita de landing page moderna, rápida e com integração oficial de WhatsApp para captação de clientes de médio e grande porte.",
      skills: ["Next.js", "Tailwind CSS", "WordPress", "WhatsApp Business API"],
      aiProposal: "Olá Marcelo, analisei detalhadamente a demanda do seu escritório. Desenvolvo interfaces jurídicas de alto padrão com estética editorial limpa, carregamento instantâneo e integração direta ao WhatsApp Business API, 100% aderente ao Provimento 205 da OAB. Já entreguei projetos similares com taxa de conversão acima de 8,5%.",
      commercialContext: "Cliente corporativo com orçamento aprovado. Alta probabilidade de fechamento rápido.",
    },
    {
      id: "opp-2",
      platform: "99Freelas",
      platformBadgeColor: "bg-[#00adef]/15 text-[#0092ca] border-[#00adef]/30",
      title: "Plataforma Web SaaS com Dashboard de Vendas e Checkout Pix Automático",
      client: "TechVenture Labs",
      publishedAt: "Há 1 hora",
      budget: "R$ 8.500,00",
      deadline: "20 a 30 dias",
      proposalsCount: 14,
      compatibilityScore: 95,
      compatibilityLevel: "Alta",
      status: sentOpportunities.includes("opp-2") ? "sent" : "proposal_ready",
      summary: "Buscamos desenvolvedor Full Stack para construir front-end com Next.js 15, autenticação RBAC, painel Kanban de tarefas e webhook para baixa instantânea de pagamentos via Pix.",
      skills: ["Next.js", "React", "Node.js", "Supabase", "Pix API"],
      aiProposal: "Olá! Possuo ampla experiência na criação de painéis SaaS e ecossistemas web corporativos com arquitetura escalável e design refinado. Desenvolvi recentemente um CRM empresarial com Kanban, conciliação Pix e controle de acessos RBAC exatamente como o solicitado.",
      commercialContext: "Projeto de médio prazo com possibilidade de contratação contínua de suporte técnico.",
    },
    {
      id: "opp-3",
      platform: "Workana",
      platformBadgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      title: "Redesign Completo de E-commerce Gamer e Otimização Core Web Vitals",
      client: "GameLoot Store",
      publishedAt: "Há 3 horas",
      budget: "R$ 4.800,00",
      deadline: "14 dias",
      proposalsCount: 19,
      compatibilityScore: 92,
      compatibilityLevel: "Alta",
      status: "sent",
      summary: "Loja virtual de jogos e gift cards precisa de reformulação visual para mobile-first, busca preditiva instantânea e velocidade de abertura nota 95+ no Google PageSpeed.",
      skills: ["E-commerce", "UI/UX Design", "WooCommerce / Next.js", "Performance"],
      aiProposal: "Olá time GameLoot! Especialista em interfaces gamer de alto impacto e performance extrema (Core Web Vitals 95+). Já estruturei e-commerces com mais de 100 mil visualizações mensais e checkout otimizado em 1 clique.",
      commercialContext: "Proposta enviada pelo assistente autônomo com portfólio Drex Games anexado.",
    },
  ];

  const handleSendProposal = (id: string) => {
    setSentOpportunities((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navegação das Plataformas */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-crm-border pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-crm-surface border border-crm-border">
          <button
            type="button"
            onClick={() => changeSubView("platforms_opportunities")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              subView === "platforms_opportunities"
                ? "bg-crm-accent text-white shadow-xs"
                : "text-crm-muted hover:text-crm-fg"
            )}
          >
            <Briefcase size={14} />
            <span>Oportunidades</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {opportunities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => changeSubView("platforms_metrics")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              subView === "platforms_metrics"
                ? "bg-crm-accent text-white shadow-xs"
                : "text-crm-muted hover:text-crm-fg"
            )}
          >
            <BarChart3 size={14} />
            <span>Métricas & Histórico</span>
          </button>

          <button
            type="button"
            onClick={() => changeSubView("platforms_catalog")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              subView === "platforms_catalog"
                ? "bg-crm-accent text-white shadow-xs"
                : "text-crm-muted hover:text-crm-fg"
            )}
          >
            <BookOpen size={14} />
            <span>Catálogo Comercial</span>
          </button>

          <button
            type="button"
            onClick={() => changeSubView("platforms_settings")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              subView === "platforms_settings"
                ? "bg-crm-accent text-white shadow-xs"
                : "text-crm-muted hover:text-crm-fg"
            )}
          >
            <Settings size={14} />
            <span>Configurações & Conectores</span>
          </button>
        </div>

        {/* Indicador de Status dos Agentes */}
        <div className="flex items-center gap-2 text-xs font-mono text-crm-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Monitoramento 99Freelas: Conectado</span>
        </div>
      </div>

      {/* VIEW 1: OPORTUNIDADES */}
      {subView === "platforms_opportunities" && (
        <div className="space-y-4">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
              <span className="text-[11px] font-mono text-crm-subtle uppercase block">Monitoradas (24h)</span>
              <span className="text-xl font-bold font-mono text-crm-fg mt-1 block">142</span>
            </div>
            <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
              <span className="text-[11px] font-mono text-crm-subtle uppercase block">Compatibilidade Alta</span>
              <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">28</span>
            </div>
            <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
              <span className="text-[11px] font-mono text-crm-subtle uppercase block">Propostas Geradas</span>
              <span className="text-xl font-bold font-mono text-crm-accent mt-1 block">12</span>
            </div>
            <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
              <span className="text-[11px] font-mono text-crm-subtle uppercase block">Valor em Aberto</span>
              <span className="text-xl font-bold font-mono text-crm-fg mt-1 block">R$ 38.400</span>
            </div>
          </div>

          {/* Lista de Cards de Oportunidades com IA */}
          <div className="space-y-3.5">
            {opportunities.map((opp) => {
              const isExpanded = expandedId === opp.id;
              const isSent = opp.status === "sent";

              return (
                <div
                  key={opp.id}
                  className="rounded-2xl border border-crm-border bg-crm-surface overflow-hidden transition-all duration-200 hover:border-crm-border-strong shadow-xs"
                >
                  <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                    {/* Header do Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border", opp.platformBadgeColor)}>
                          {opp.platform}
                        </span>
                        <span className="text-xs text-crm-subtle font-mono">{opp.publishedAt}</span>
                        <span className="text-xs text-crm-subtle font-mono hidden sm:inline">• {opp.proposalsCount} propostas</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                          <Sparkles size={11} />
                          <span>{opp.compatibilityScore}% Afinidade</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-crm-fg px-2.5 py-0.5 rounded-lg bg-crm-canvas border border-crm-border">
                          {opp.budget}
                        </span>
                      </div>
                    </div>

                    {/* Título & Cliente */}
                    <div>
                      <h3 className="text-[15.5px] font-semibold text-crm-fg hover:text-crm-accent transition-colors">
                        {opp.title}
                      </h3>
                      <p className="text-xs text-crm-subtle mt-0.5 font-medium">
                        Cliente: <span className="text-crm-fg">{opp.client}</span> • Prazo estimado: {opp.deadline}
                      </p>
                    </div>

                    {/* Resumo da Demanda */}
                    <p className="text-xs text-crm-muted leading-relaxed">
                      {opp.summary}
                    </p>

                    {/* Tags de Tecnologias */}
                    <div className="flex flex-wrap gap-1.5">
                      {opp.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-crm-canvas text-crm-muted text-[10px] font-mono border border-crm-border">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Proposta da IA (Caixa Expansível) */}
                    <div className="mt-1 pt-3 border-t border-crm-border flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-crm-accent hover:underline cursor-pointer"
                        >
                          <Bot size={13} />
                          <span>{isExpanded ? "Ocultar proposta elaborada pela IA" : "Ver proposta personalizada elaborada pela IA"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-mono border border-emerald-500/30">
                              <CheckCircle2 size={13} />
                              <span>Proposta Enviada</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendProposal(opp.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#d8ff7c] hover:bg-[#cbf66a] text-neutral-950 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                              <Send size={12} />
                              <span>Aprovar & Enviar ao 99Freelas</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3.5 rounded-xl bg-crm-canvas border border-crm-border text-xs text-crm-fg font-sans leading-relaxed space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-[11px] font-mono text-crm-subtle border-b border-crm-border/60 pb-1.5">
                            <span>Modelo: Gemini 1.5 Pro • Direção Comercial ANXIS</span>
                            <span className="text-emerald-500 font-semibold">Pronta para envio</span>
                          </div>
                          <p className="whitespace-pre-line">{opp.aiProposal}</p>
                          <div className="pt-1 text-[11px] font-mono text-crm-subtle">
                            Contexto: {opp.commercialContext}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MÉTRICAS */}
      {subView === "platforms_metrics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-crm-border bg-crm-surface space-y-2">
              <span className="text-xs font-mono text-crm-subtle uppercase">Taxa de Resposta de Propostas</span>
              <div className="text-3xl font-bold font-mono text-emerald-500">38.2%</div>
              <p className="text-xs text-crm-muted">Propostas geradas com afinidade acima de 90% recebem resposta em até 4 horas.</p>
            </div>
            <div className="p-5 rounded-2xl border border-crm-border bg-crm-surface space-y-2">
              <span className="text-xs font-mono text-crm-subtle uppercase">Ticket Médio Proposto</span>
              <div className="text-3xl font-bold font-mono text-crm-fg">R$ 4.250</div>
              <p className="text-xs text-crm-muted">Propostas alinhadas aos valores base do catálogo comercial.</p>
            </div>
            <div className="p-5 rounded-2xl border border-crm-border bg-crm-surface space-y-2">
              <span className="text-xs font-mono text-crm-subtle uppercase">Total Fechado pelo Conector</span>
              <div className="text-3xl font-bold font-mono text-crm-accent">R$ 52.800</div>
              <p className="text-xs text-crm-muted">Últimos 90 dias através de automações de prospecção.</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CATÁLOGO COMERCIAL */}
      {subView === "platforms_catalog" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Landing Page de Alta Conversão", price: "R$ 2.400,00", days: "7 dias", desc: "Design autoral editorial, Next.js ou WordPress, integração de WhatsApp Business e Core Web Vitals 95+." },
              { name: "Site Institucional & Corporativo", price: "R$ 3.800,00", days: "14 dias", desc: "Páginas por serviços, CMS facilitado, páginas de contato com formulário e mapa interativo." },
              { name: "E-commerce & Catálogo Gamer / Varejo", price: "R$ 5.200,00", days: "21 dias", desc: "Checkout transparente via Pix e Cartão, cálculo de frete ou entrega de keys digitais automática." },
              { name: "Sistema Web SaaS & Painel CRM", price: "R$ 8.500,00", days: "30 dias", desc: "Painel administrativo com Kanban, banco de dados Supabase, autenticação RBAC e métricas financeiras." },
            ].map((item) => (
              <div key={item.name} className="p-5 rounded-2xl border border-crm-border bg-crm-surface space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-crm-fg text-sm">{item.name}</h4>
                  <span className="font-mono font-bold text-crm-accent text-sm">{item.price}</span>
                </div>
                <p className="text-xs text-crm-muted leading-relaxed">{item.desc}</p>
                <div className="text-[11px] font-mono text-crm-subtle pt-2 border-t border-crm-border">
                  Prazo de entrega base: {item.days}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: CONFIGURAÇÕES */}
      {subView === "platforms_settings" && (
        <div className="p-6 rounded-2xl border border-crm-border bg-crm-surface space-y-5 max-w-2xl">
          <h3 className="text-base font-semibold text-crm-fg">Parâmetros de Análise & Automação</h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-crm-border">
              <div>
                <span className="font-medium text-crm-fg block">Filtro Mínimo de Compatibilidade</span>
                <span className="text-crm-subtle text-[11px]">Projetos com afinidade abaixo deste limite são descartados.</span>
              </div>
              <span className="font-mono font-bold text-crm-fg">60%</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-crm-border">
              <div>
                <span className="font-medium text-crm-fg block">Orçamento Mínimo Aceito</span>
                <span className="text-crm-subtle text-[11px]">Ignora demandas abaixo deste valor nas plataformas.</span>
              </div>
              <span className="font-mono font-bold text-crm-fg">R$ 800,00</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-crm-border">
              <div>
                <span className="font-medium text-crm-fg block">Integração WhatsApp Business API</span>
                <span className="text-crm-subtle text-[11px]">Envio de notificações de novas oportunidades no celular.</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">Ativo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
