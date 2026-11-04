"use client";

import React from "react";
import { ChartNoAxesCombined, TrendingUp, DollarSign, CreditCard, QrCode } from "lucide-react";

export function ReportsTab() {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">INTELIGÊNCIA DE VENDAS</span>
          <h1>Relatórios Financeiros & Faturamento</h1>
          <p>Visão consolidada de conversão, ticket médio e distribuição por meio de pagamento.</p>
        </div>
        <span className="admin-heading-icon">
          <ChartNoAxesCombined size={25} />
        </span>
      </div>

      <div className="admin-metrics">
        <article className="admin-metric">
          <div>
            <span>Faturamento no Mês</span>
            <DollarSign size={21} className="text-[#7138c5]" />
          </div>
          <strong>R$ 42.890,50</strong>
          <p className="text-emerald-700 font-semibold">+18.4% comparado ao mês anterior</p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Ticket Médio</span>
            <TrendingUp size={21} className="text-[#7138c5]" />
          </div>
          <strong>R$ 142,30</strong>
          <p>Média consolidada em 1.842 pedidos</p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Volume via PIX</span>
            <QrCode size={21} className="text-emerald-600" />
          </div>
          <strong>68.2%</strong>
          <p>Liquidação e liberação imediata</p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Cartão de Crédito</span>
            <CreditCard size={21} className="text-blue-600" />
          </div>
          <strong>31.8%</strong>
          <p>Aprovação antifraude com baixa contestação</p>
        </article>
      </div>

      <section className="admin-panel p-6">
        <div className="admin-panel-heading border-b-0 pb-4">
          <div>
            <h2>Distribuição de Métodos de Pagamento</h2>
            <p>Participação percentual na receita bruta dos últimos 30 dias.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-neutral-800">
                <QrCode size={15} className="text-emerald-600" /> PIX (Com 5% OFF)
              </span>
              <strong className="text-emerald-700 font-mono text-sm">68.2% (R$ 29.251,32)</strong>
            </div>
            <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[68.2%]" />
            </div>
            <p className="text-[11px] text-neutral-500">
              Maior taxa de conversão da loja devido ao desconto de pagamento instantâneo.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-neutral-800">
                <CreditCard size={15} className="text-blue-600" /> Cartão de Crédito (Até 12x)
              </span>
              <strong className="text-blue-700 font-mono text-sm">31.8% (R$ 13.639,18)</strong>
            </div>
            <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[31.8%]" />
            </div>
            <p className="text-[11px] text-neutral-500">
              Integrado via Asaas com análise transparente e liberação automatizada de chaves.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
