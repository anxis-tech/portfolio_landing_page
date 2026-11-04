import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logoipsum CRM & ERP | Painel de Gestão e Vendas',
  description:
    'Showcase interativo de painel administrativo CRM com Kanban, conversas WhatsApp, precificação inteligente, financeiro e controle RBAC.',
}

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="crm-root min-h-screen">{children}</div>
}
