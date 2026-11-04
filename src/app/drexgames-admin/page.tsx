"use client";

import React, { useState, useEffect } from "react";
import "./drexgames-admin.css";
import { DrexAdminShell, DrexTab } from "@/components/drexgames-admin/drexgames-admin-shell";
import { DashboardTab } from "@/components/drexgames-admin/tabs/dashboard-tab";
import { CatalogTab } from "@/components/drexgames-admin/tabs/catalog-tab";
import { OrdersTab } from "@/components/drexgames-admin/tabs/orders-tab";
import { CustomersTab } from "@/components/drexgames-admin/tabs/customers-tab";
import { ReportsTab } from "@/components/drexgames-admin/tabs/reports-tab";
import { CouponsTab } from "@/components/drexgames-admin/tabs/coupons-tab";
import { IntegrationsTab } from "@/components/drexgames-admin/tabs/integrations-tab";
import { DrexLoginView } from "@/components/drexgames-admin/auth/drexgames-login-view";
import { DrexOrder } from "@/components/drexgames-admin/drexgames-mock-data";

export default function DrexGamesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DrexTab>("dashboard");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<DrexOrder | null>(null);

  const [isEmbedded, setIsEmbedded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const isEmbedParam = new URLSearchParams(window.location.search).get("embed") === "true";
        const isFramed = window.self !== window.top;
        return isEmbedParam || isFramed;
      } catch {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") as DrexTab | null;
      if (tabParam) setActiveTab(tabParam);

      const isEmbedParam = searchParams.get("embed") === "true";
      let isFramed = false;
      try {
        isFramed = window.self !== window.top;
      } catch {
        isFramed = true;
      }
      setIsEmbedded(isEmbedParam || isFramed);
    }
  }, []);

  const handleSelectTab = (tab: DrexTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <DrexLoginView onSuccessLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <DrexAdminShell
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onLogout={handleLogout}
      isEmbedded={isEmbedded}
      userName="Mateus Oliveira"
    >
      {activeTab === "dashboard" && (
        <DashboardTab
          onNavigate={(tab) => handleSelectTab(tab)}
          onSelectOrder={(order) => {
            setSelectedOrderForDetail(order);
            handleSelectTab("pedidos");
          }}
        />
      )}

      {activeTab === "catalogo" && <CatalogTab />}

      {activeTab === "pedidos" && (
        <OrdersTab initialSelectedOrder={selectedOrderForDetail} />
      )}

      {activeTab === "clientes" && <CustomersTab />}

      {activeTab === "relatorios" && <ReportsTab />}

      {activeTab === "cupons" && <CouponsTab />}

      {activeTab === "integracoes" && <IntegrationsTab />}
    </DrexAdminShell>
  );
}
