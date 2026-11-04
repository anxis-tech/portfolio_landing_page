"use client";

import React, { useState, useMemo } from "react";
import { Search, ShoppingBag, CheckCircle, Clock, XCircle, CreditCard, QrCode } from "lucide-react";
import { DREX_ORDERS, DrexOrder } from "../drexgames-mock-data";

export function OrdersTab({
  initialSelectedOrder,
}: {
  initialSelectedOrder?: DrexOrder | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DrexOrder | null>(
    initialSelectedOrder || null
  );

  const filteredOrders = useMemo(() => {
    return DREX_ORDERS.filter((order) => {
      const matchSearch =
        !searchTerm ||
        String(order.number).includes(searchTerm.replace("#", "")) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = !statusFilter || order.status === statusFilter;
      const matchMethod = !methodFilter || order.method === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [searchTerm, statusFilter, methodFilter]);

  const formatMoney = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: DrexOrder["status"]) => {
    switch (status) {
      case "PAID":
        return <span className="admin-badge admin-status-paid"><span aria-hidden="true" />Pago</span>;
      case "PROCESSING":
        return <span className="admin-badge admin-status-processing"><span aria-hidden="true" />Em processamento</span>;
      case "PENDING":
        return <span className="admin-badge admin-status-pending"><span aria-hidden="true" />Aguardando pagamento</span>;
      case "OVERDUE":
        return <span className="admin-badge admin-status-overdue"><span aria-hidden="true" />Vencido</span>;
      case "CANCELED":
      case "REFUNDED":
        return <span className="admin-badge admin-status-canceled"><span aria-hidden="true" />Cancelado</span>;
      default:
        return <span className="admin-badge"><span aria-hidden="true" />{status}</span>;
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">ACOMPANHAMENTO OPERACIONAL</span>
          <h1>Pedidos & Faturamento</h1>
          <p>Consulte os pedidos, itens, conciliação de pagamento e status da entrega de chaves.</p>
        </div>
        <span className="admin-heading-icon">
          <ShoppingBag size={25} />
        </span>
      </div>

      <section className="admin-panel">
        {/* Filtros Oficiais DrexGames */}
        <div className="admin-filters admin-order-filters">
          <label className="admin-field admin-search-field">
            Pesquisar pedido
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Número do pedido, produto, SKU ou cliente..."
                maxLength={100}
              />
            </div>
          </label>

          <label className="admin-field">
            Status
            <select
              aria-label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="PAID">Pago</option>
              <option value="PROCESSING">Em processamento</option>
              <option value="PENDING">Aguardando pagamento</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </label>

          <label className="admin-field">
            Pagamento
            <select
              aria-label="Pagamento"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="">Todos os meios</option>
              <option value="PIX">PIX</option>
              <option value="CREDIT_CARD">Cartão de crédito</option>
            </select>
          </label>

          {(searchTerm || statusFilter || methodFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setMethodFilter("");
              }}
              className="admin-clear cursor-pointer bg-transparent border-0 self-end mb-2"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Resumo da Listagem */}
        <div className="admin-list-heading">
          <h2>
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
          </h2>
          <p>Datas no horário oficial de Brasília. Valores correspondem ao total faturado.</p>
        </div>

        {/* Tabela de Pedidos */}
        <div
          className="admin-table-scroll"
          role="region"
          aria-label="Lista de pedidos"
          tabIndex={0}
        >
          <table className="admin-table admin-orders-table">
            <thead>
              <tr>
                <th scope="col">Pedido / Criação</th>
                <th scope="col">Itens do pedido</th>
                <th scope="col">Cliente</th>
                <th scope="col">Status</th>
                <th scope="col">Pagamento</th>
                <th scope="col" className="admin-number">
                  Valor do pedido
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.number}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="admin-order-number admin-text-link cursor-pointer text-left bg-transparent border-0 font-bold"
                    >
                      #{order.number}
                    </button>
                    <span className="admin-cell-secondary admin-nowrap">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td>
                    <strong className="admin-product-name">
                      {order.itemsCount}× {order.productName}
                    </strong>
                    <span className="admin-cell-secondary">
                      {order.variantName || order.sku}
                    </span>
                  </td>
                  <td>
                    <span className="font-semibold text-neutral-800 text-[12px] block">
                      {order.customerName}
                    </span>
                    <span className="admin-cell-secondary">{order.customerEmail}</span>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="admin-nowrap font-medium text-[11px] text-neutral-700">
                    <span className="inline-flex items-center gap-1.5">
                      {order.method === "PIX" ? (
                        <QrCode size={13} className="text-emerald-600" />
                      ) : (
                        <CreditCard size={13} className="text-blue-600" />
                      )}
                      {order.method === "PIX" ? "PIX Instantâneo" : "Cartão de Crédito"}
                    </span>
                  </td>
                  <td className="admin-number">
                    <strong>{formatMoney(order.amountCents)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#7138c5] uppercase tracking-wider">
                  Detalhes Operacionais do Pedido
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                  Pedido #{selectedOrder.number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Cliente</span>
                <strong className="text-neutral-900 text-[13px]">{selectedOrder.customerName}</strong>
                <span className="text-[11px] text-neutral-500 block truncate">{selectedOrder.customerEmail}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Data e Horário</span>
                <strong className="text-neutral-900 text-[12px]">{formatDate(selectedOrder.createdAt)}</strong>
                <span className="text-[11px] text-neutral-500 block">Horário de Brasília</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Meio & Status</span>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Total Faturado</span>
                <strong className="text-neutral-900 text-[14px] text-emerald-700 font-bold block mt-1">
                  {formatMoney(selectedOrder.amountCents)}
                </strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-1.5">
              <span className="text-neutral-500 text-[11px] font-semibold block uppercase">Itens e Chaves Digitais</span>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-neutral-900 block">{selectedOrder.productName}</strong>
                  <span className="text-neutral-500 text-[11px]">{selectedOrder.sku}</span>
                </div>
                <span className="font-mono text-xs font-bold text-neutral-800">
                  {formatMoney(selectedOrder.amountCents)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
              <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nota Fiscal & Entrega:</strong> NF-e transmitida com sucesso para o Bling ERP sob a chave <code>352611...</code>. Chave de ativação enviada para o e-mail do cliente.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="admin-button cursor-pointer"
              >
                Concluir consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
