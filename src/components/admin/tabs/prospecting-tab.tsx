"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Send,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProspectingTab({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [activeSegment, setActiveSegment] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const leads = [
    {
      id: "pros-1",
      company: "Clínica Vasconcelos Dermatologia",
      contact: "Dra. Camila Vasconcelos",
      segment: "Saúde & Estética",
      city: "São Paulo, SP",
      phone: "+55 11 98765-4321",
      score: 94,
      priority: "Quente",
      channel: "WhatsApp Business API",
      status: "Conversa Iniciada",
      lastMessage: "Mateus, você conseguiu verificar a prévia do seletor de procedimentos?",
      lastMessageTime: "Há 15 min",
    },
    {
      id: "pros-2",
      company: "Drummond & Associados Advocacia",
      contact: "Dr. Marcelo Drummond",
      segment: "Jurídico",
      city: "Campinas, SP",
      phone: "+55 19 99123-9876",
      score: 91,
      priority: "Quente",
      channel: "WhatsApp Business API",
      status: "Proposta Aberta",
      lastMessage: "Recebemos o link do orçamento pelo painel. Aprovamos a etapa 1.",
      lastMessageTime: "Há 2 horas",
    },
    {
      id: "pros-3",
      company: "Ótica Visão Prime",
      contact: "Roberto Silveira",
      segment: "Varejo & E-commerce",
      city: "Belo Horizonte, MG",
      phone: "+55 31 98877-6655",
      score: 82,
      priority: "Morno",
      channel: "WhatsApp Business API",
      status: "Mensagem Enviada",
      lastMessage: "Apresentação do catálogo de e-commerce e entregas automatizadas enviada.",
      lastMessageTime: "Ontem",
    },
    {
      id: "pros-4",
      company: "Studio Odonto Kids",
      contact: "Dra. Patrícia Bueno",
      segment: "Saúde & Estética",
      city: "Ribeirão Preto, SP",
      phone: "+55 16 99654-1234",
      score: 88,
      priority: "Morno",
      channel: "WhatsApp Business API",
      status: "Reunião Agendada",
      lastMessage: "Reunião de alinhamento marcada para quinta-feira às 15h via Google Meet.",
      lastMessageTime: "Hoje às 09:30",
    },
  ];

  const filteredLeads = leads.filter((l) => {
    const matchesSegment = activeSegment === "todos" || l.segment.toLowerCase().includes(activeSegment.toLowerCase());
    const matchesSearch = l.company.toLowerCase().includes(searchTerm.toLowerCase()) || l.contact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSegment && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header com Métricas da Prospecção */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Leads Mapeados</span>
          <span className="text-xl font-bold font-mono text-crm-fg mt-1 block">420</span>
        </div>
        <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Contatados via WhatsApp</span>
          <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">186</span>
        </div>
        <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Taxa de Abertura</span>
          <span className="text-xl font-bold font-mono text-crm-accent mt-1 block">78.4%</span>
        </div>
        <div className="p-3.5 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Reuniões Geradas</span>
          <span className="text-xl font-bold font-mono text-crm-fg mt-1 block">24</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-crm-border bg-crm-surface">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "todos", label: "Todos os Segmentos" },
            { id: "saúde", label: "Saúde & Clínicas" },
            { id: "jurídico", label: "Escritórios Jurídicos" },
            { id: "varejo", label: "E-commerce & Lojas" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSegment(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeSegment === tab.id
                  ? "bg-crm-accent text-white shadow-xs font-semibold"
                  : "text-crm-muted hover:text-crm-fg hover:bg-crm-canvas"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-crm-subtle pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar empresa ou contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-crm-canvas border border-crm-border text-xs text-crm-fg placeholder:text-crm-subtle focus:outline-hidden focus:border-crm-accent"
          />
        </div>
      </div>

      {/* Tabela de Leads Prospectados */}
      <div className="rounded-2xl border border-crm-border bg-crm-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-crm-canvas border-b border-crm-border text-crm-subtle font-mono uppercase text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Empresa / Responsável</th>
                <th className="py-3 px-3">Segmento</th>
                <th className="py-3 px-3">Canal & Telefone</th>
                <th className="py-3 px-3 text-center">Score IA</th>
                <th className="py-3 px-3">Status Comercial</th>
                <th className="py-3 px-4 text-right">Última Interação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border font-sans">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-crm-canvas/60 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-crm-fg text-[13px]">{lead.company}</div>
                    <div className="text-crm-subtle text-[11px]">{lead.contact} • {lead.city}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-crm-canvas border border-crm-border font-mono text-[10.5px] text-crm-muted">
                      {lead.segment}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11.5px] font-medium">
                      <MessageCircle size={13} />
                      <span>{lead.phone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10.5px]">
                      <Flame size={11} />
                      <span>{lead.score}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-crm-canvas border border-crm-border text-crm-fg font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{lead.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="text-crm-subtle text-[11px] font-mono">{lead.lastMessageTime}</div>
                    <div className="text-crm-muted text-[11.5px] truncate max-w-xs ml-auto">{lead.lastMessage}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
