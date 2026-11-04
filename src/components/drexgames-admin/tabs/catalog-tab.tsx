"use client";

import React, { useState, useMemo } from "react";
import { LibraryBig, Plus, Search, KeyRound } from "lucide-react";
import { DREX_PRODUCTS, DrexProduct } from "../drexgames-mock-data";

export function CatalogTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<DrexProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return DREX_PRODUCTS.filter((product) => {
      const matchSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        !statusFilter ||
        (statusFilter === "active" && product.active) ||
        (statusFilter === "inactive" && !product.active);
      const matchPlatform =
        !platformFilter || product.platform.toLowerCase().includes(platformFilter.toLowerCase());

      return matchSearch && matchStatus && matchPlatform;
    });
  }, [searchTerm, statusFilter, platformFilter]);

  const formatMoney = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">GESTÃO DE CATÁLOGO</span>
          <h1>Catálogo de Jogos Digitais</h1>
          <p>Pesquise produtos, gerencie chaves digitais e confira preços e disponibilidade.</p>
        </div>
        <button
          type="button"
          onClick={() => alert("Demonstração: funcionalidade de cadastro em modo vitrine.")}
          className="admin-button cursor-pointer"
        >
          <Plus size={17} /> Novo produto
        </button>
      </div>

      <section className="admin-panel">
        {/* Filtros Oficiais DrexGames */}
        <div className="admin-filters">
          <label className="admin-field admin-search-field">
            Pesquisar produto
            <div className="admin-search">
              <Search size={18} />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou SKU do produto..."
                maxLength={100}
              />
            </div>
          </label>

          <label className="admin-field">
            Status
            <select
              aria-label="Status do produto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>

          <label className="admin-field">
            Plataforma
            <select
              aria-label="Plataforma"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="">Todas as plataformas</option>
              <option value="steam">Steam</option>
              <option value="rockstar">Rockstar</option>
              <option value="microsoft">Microsoft Store</option>
            </select>
          </label>

          {(searchTerm || statusFilter || platformFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPlatformFilter("");
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </h2>
          <p>Estoque atualizado em tempo real com controle de integridade de chaves criptografadas.</p>
        </div>

        {/* Tabela de Produtos */}
        <div
          className="admin-table-scroll"
          role="region"
          aria-label="Catálogo de produtos"
          tabIndex={0}
        >
          <table className="admin-table admin-catalog-table">
            <thead>
              <tr>
                <th scope="col">Produto / SKU</th>
                <th scope="col">Categorias</th>
                <th scope="col">Status</th>
                <th scope="col" className="admin-number">
                  Preço de venda
                </th>
                <th scope="col">Estoque Digital</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong className="admin-product-name">{product.name}</strong>
                    <span className="admin-cell-secondary admin-sku">{product.sku}</span>
                  </td>
                  <td>
                    <span className="admin-categories">
                      {product.categories.join(" · ") || "Sem categoria"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        product.active ? "admin-status-paid" : "admin-status-inactive"
                      }`}
                    >
                      <span aria-hidden="true" />
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="admin-number">
                    {product.promoPriceCents ? (
                      <>
                        <span className="admin-price-original">
                          {formatMoney(product.priceCents)}
                        </span>
                        <strong className="admin-cell-secondary text-[#7138c5]">
                          {formatMoney(product.promoPriceCents)}
                        </strong>
                      </>
                    ) : (
                      <strong>{formatMoney(product.priceCents)}</strong>
                    )}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <KeyRound size={13} />
                      {product.stockCount} chaves
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="admin-text-link cursor-pointer bg-transparent border-0"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Detalhes do Produto / Entrega Digital */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#7138c5] uppercase tracking-wider">
                  Detalhes do Produto
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">SKU Oficial</span>
                <strong className="font-mono text-neutral-900 text-[13px]">{selectedProduct.sku}</strong>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Plataforma</span>
                <strong className="text-neutral-900 text-[13px]">{selectedProduct.platform}</strong>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Preço de Venda</span>
                <strong className="text-neutral-900 text-[13px]">
                  {formatMoney(selectedProduct.promoPriceCents || selectedProduct.priceCents)}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-neutral-500 block">Chaves no Cofre</span>
                <strong className="text-emerald-700 text-[13px] font-bold">
                  {selectedProduct.stockCount} disponíveis
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-900 leading-relaxed">
              <strong>Automação de Entrega Digital:</strong> Quando o webhook do Asaas ou Bling confirma o pagamento, uma chave é resgatada do cofre criptografado com hash SHA-256 e despachada para o e-mail do comprador em menos de 3 segundos.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="admin-button cursor-pointer"
              >
                Fechar consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
