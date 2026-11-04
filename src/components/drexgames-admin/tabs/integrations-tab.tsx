"use client";

import React from "react";
import { PlugZap, CheckCircle2, ShieldCheck, RefreshCw, FileText, Send } from "lucide-react";

export function IntegrationsTab() {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CONECTIVIDADE DO SISTEMA</span>
          <h1>Integrações Operacionais & ERP</h1>
          <p>Conexões ativas com o Bling ERP, emissão de NF-e, gateway de pagamentos e servidores de e-mail.</p>
        </div>
        <span className="admin-heading-icon">
          <PlugZap size={25} />
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bling ERP */}
        <section className="admin-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-base text-neutral-900">Bling ERP</span>
            <span className="admin-badge admin-status-paid">
              <span aria-hidden="true" /> Operacional
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Sincronização de pedidos pagos, emissão automática de Nota Fiscal Eletrônica (NF-e) com certificado digital A1 e controle de estoque compartilhado.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-200/80">
            <div className="flex justify-between text-neutral-600">
              <span>Token OAuth 2.0:</span>
              <strong className="text-emerald-700">Conectado</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Certificado Digital:</span>
              <strong className="text-neutral-800">A1 (Expira em 10/2027)</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Emissão automática:</span>
              <strong className="text-emerald-700">Ativa</strong>
            </div>
          </div>
        </section>

        {/* Asaas Gateway */}
        <section className="admin-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-base text-neutral-900">Asaas Pagamentos</span>
            <span className="admin-badge admin-status-paid">
              <span aria-hidden="true" /> Operacional
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Processamento de Pix instantâneo com QR Code dinâmico e cartão de crédito com tokenização segura e verificação antifraude integrada.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-200/80">
            <div className="flex justify-between text-neutral-600">
              <span>Webhook Pix:</span>
              <strong className="text-emerald-700">200 OK (Tempo real)</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Webhook Cartão:</span>
              <strong className="text-emerald-700">Ativo</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Taxa de aprovação:</span>
              <strong className="text-neutral-800">98.6%</strong>
            </div>
          </div>
        </section>

        {/* SMTP Transacional */}
        <section className="admin-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-base text-neutral-900">SMTP Transacional</span>
            <span className="admin-badge admin-status-paid">
              <span aria-hidden="true" /> Operacional
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Envio imediato de comprovantes de pagamento e entrega das chaves de ativação digitais com autenticação DKIM, SPF e DMARC.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1.5 border border-neutral-200/80">
            <div className="flex justify-between text-neutral-600">
              <span>Servidor:</span>
              <strong className="text-neutral-800">Titan / Brevo SMTP</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Taxa de entrega:</span>
              <strong className="text-emerald-700">99.8% na caixa de entrada</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Tempo de disparo:</span>
              <strong className="text-neutral-800">&lt; 2.4s pós-pagamento</strong>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
