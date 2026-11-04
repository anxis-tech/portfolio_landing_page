"use client";

import React, { useState, useMemo } from "react";
import { Search, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DREX_CUSTOMERS } from "../drexgames-mock-data";

export function CustomersTab() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    return DREX_CUSTOMERS.filter((customer) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.maskedDocument.includes(term)
      );
    });
  }, [searchTerm]);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">GESTÃO DE CLIENTES</span>
          <h1>Base de Clientes & Cadastros</h1>
          <p>Consulte a carteira de clientes, documentos mascarados e verificação de e-mail.</p>
        </div>
        <span className="admin-heading-icon">
          <Users size={25} />
        </span>
      </div>

      <section className="admin-panel">
        <div className="admin-filters">
          <label className="admin-field admin-search-field">
            Pesquisar cliente
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, e-mail ou CPF..."
                maxLength={100}
              />
            </div>
          </label>
        </div>

        <div className="admin-list-heading">
          <h2>
            {filteredCustomers.length}{" "}
            {filteredCustomers.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
          </h2>
          <p>Proteção integral de dados sensíveis em conformidade com as diretrizes da LGPD.</p>
        </div>

        <div
          className="admin-table-scroll"
          role="region"
          aria-label="Clientes cadastrados"
          tabIndex={0}
        >
          <table className="admin-table customer-list-table">
            <thead>
              <tr>
                <th scope="col">Cliente / E-mail</th>
                <th scope="col">Documento Mascarado</th>
                <th scope="col">Cadastro</th>
                <th scope="col">E-mail</th>
                <th scope="col">Total Pedidos</th>
                <th scope="col">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <strong className="admin-product-name">{customer.name}</strong>
                    <span className="admin-cell-secondary">{customer.email}</span>
                  </td>
                  <td className="font-mono text-neutral-600 font-medium">
                    {customer.maskedDocument}
                  </td>
                  <td>
                    <span className="admin-badge admin-status-paid">
                      <span aria-hidden="true" />
                      Completo
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> Verificado
                    </span>
                  </td>
                  <td className="font-bold text-neutral-800">{customer.ordersCount} pedidos</td>
                  <td>
                    <span className="admin-text-link">Ativo</span>
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
