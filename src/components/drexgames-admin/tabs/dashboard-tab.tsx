"use client";

import React from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LibraryBig,
  ShoppingBag,
} from "lucide-react";
import {
  DREX_METRICS,
  DREX_ORDERS,
  DrexOrder,
} from "../drexgames-mock-data";

export function DashboardTab({
  onNavigate,
  onSelectOrder,
}: {
  onNavigate: (tab: "catalogo" | "pedidos") => void;
  onSelectOrder?: (order: DrexOrder) => void;
}) {
  const recentOrders = DREX_ORDERS.slice(0, 5);

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
      {/* Cabeçalho da Página */}
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">VISÃO DA OPERAÇÃO</span>
          <h1>Resumo operacional</h1>
          <p>Acompanhe os registros e os próximos pontos de atenção do e-commerce.</p>
        </div>
        <span className="admin-updated">
          Consulta em tempo real
          <small>Horário de Brasília</small>
        </span>
      </div>

      {/* Cartões de Métricas Oficiais */}
      <div className="admin-metrics">
        <article className="admin-metric">
          <div>
            <span>Produtos no catálogo</span>
            <LibraryBig size={21} />
          </div>
          <strong>{DREX_METRICS.totalProducts.toLocaleString("pt-BR")}</strong>
          <p>
            {DREX_METRICS.activeProducts} ativos · {DREX_METRICS.inactiveProducts} inativos
          </p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Pedidos registrados</span>
            <ShoppingBag size={21} />
          </div>
          <strong>{DREX_METRICS.totalOrders.toLocaleString("pt-BR")}</strong>
          <p>Todo o histórico da loja DrexGames</p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Aguardando pagamento</span>
            <Clock3 size={21} />
          </div>
          <strong>{DREX_METRICS.pendingOrders.toLocaleString("pt-BR")}</strong>
          <p>
            {DREX_METRICS.processingOrders} em processamento · {DREX_METRICS.overdueOrders} vencidos
          </p>
        </article>

        <article className="admin-metric">
          <div>
            <span>Pedidos pagos</span>
            <CheckCircle2 size={21} />
          </div>
          <strong>{DREX_METRICS.paidOrders.toLocaleString("pt-BR")}</strong>
          <p>Chaves digitais entregues automaticamente</p>
        </article>
      </div>

      {/* Painel de Pedidos Mais Recentes */}
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Pedidos mais recentes</h2>
            <p>Últimos cinco registros da operação, por data de criação.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("pedidos")}
            className="admin-text-link cursor-pointer bg-transparent border-0"
          >
            Consultar todos os pedidos <ArrowUpRight size={16} />
          </button>
        </div>

        <div
          className="admin-table-scroll"
          role="region"
          aria-label="Pedidos mais recentes"
          tabIndex={0}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Produto principal</th>
                <th scope="col">Criado em</th>
                <th scope="col">Status</th>
                <th scope="col" className="admin-number">
                  Valor do pedido
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.number}>
                  <td className="admin-order-number">
                    <button
                      type="button"
                      onClick={() => onSelectOrder?.(order)}
                      className="cursor-pointer text-left bg-transparent border-0 font-bold text-[#7138c5] hover:underline"
                    >
                      #{order.number}
                    </button>
                  </td>
                  <td>
                    <strong className="admin-product-name">{order.productName}</strong>
                    {order.variantName && (
                      <span className="admin-cell-secondary">{order.variantName}</span>
                    )}
                  </td>
                  <td className="admin-nowrap">{formatDate(order.createdAt)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="admin-number">
                    <strong>{formatMoney(order.amountCents)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Atalhos Rápidos */}
      <section className="admin-quick-links" aria-label="Consultas disponíveis">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("catalogo")}
          className="cursor-pointer select-none"
        >
          <LibraryBig size={24} />
          <div>
            <h2>Consultar catálogo</h2>
            <p>Localize jogos digitais, estoque de keys e confira preços e disponibilidade.</p>
          </div>
          <ArrowUpRight size={20} />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate("pedidos")}
          className="cursor-pointer select-none"
        >
          <ShoppingBag size={24} />
          <div>
            <h2>Consultar pedidos</h2>
            <p>Filtre por status, meios de pagamento e acompanhe a entrega digital.</p>
          </div>
          <ArrowUpRight size={20} />
        </div>
      </section>
    </>
  );
}
