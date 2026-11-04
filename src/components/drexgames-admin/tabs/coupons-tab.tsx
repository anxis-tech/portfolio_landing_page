"use client";

import React from "react";
import { Ticket, Plus, Tag } from "lucide-react";
import { DREX_COUPONS } from "../drexgames-mock-data";

export function CouponsTab() {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">CAMPANHAS DE VENDAS</span>
          <h1>Cupons & Políticas de Desconto</h1>
          <p>Crie cupons promocionais, configure regras de desconto fixo ou percentual.</p>
        </div>
        <button
          type="button"
          onClick={() => alert("Demonstração: criação de cupom em modo vitrine.")}
          className="admin-button cursor-pointer"
        >
          <Plus size={17} /> Novo cupom
        </button>
      </div>

      <section className="admin-panel">
        <div className="admin-list-heading">
          <h2>Cupons ativos na loja</h2>
          <p>Aplicação automática com validação de uso único por CPF.</p>
        </div>

        <div className="admin-table-scroll" role="region" aria-label="Cupons" tabIndex={0}>
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Código do Cupom</th>
                <th scope="col">Tipo de Desconto</th>
                <th scope="col">Regra de Aplicação</th>
                <th scope="col">Usos Concluídos</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {DREX_COUPONS.map((coupon) => (
                <tr key={coupon.code}>
                  <td>
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#7138c5] bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                      <Tag size={13} /> {coupon.code}
                    </span>
                  </td>
                  <td>
                    <strong className="text-neutral-900 text-xs">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% OFF`
                        : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                    </strong>
                  </td>
                  <td>
                    <span className="text-xs text-neutral-600">{coupon.description}</span>
                  </td>
                  <td>
                    <strong className="text-neutral-800 text-xs">{coupon.usageCount} pedidos</strong>
                  </td>
                  <td>
                    <span className="admin-badge admin-status-paid">
                      <span aria-hidden="true" /> Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
