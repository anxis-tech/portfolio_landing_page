'use client'

import React, { useState } from 'react'
import type { ClientProject } from '@/types/client-project.types'
import type { Contract } from '@/types/contract.types'
import { FiscalInvoicesTab } from './fiscal-invoices-tab'
import { FiscalSettingsTab } from './fiscal-settings-tab'
import { MOCK_CLIENT_PROJECTS, MOCK_CONTRACTS } from '@/components/admin/mock-crm-data'
import { cn } from '@/lib/utils'

export function FiscalWorkspaceTab({
  projects = MOCK_CLIENT_PROJECTS,
  contracts = MOCK_CONTRACTS,
  canView = true,
  canIssue = true,
  canManageSettings = true,
  isDarkMode = true,
}: {
  projects?: ClientProject[]
  contracts?: Contract[]
  canView?: boolean
  canIssue?: boolean
  canManageSettings?: boolean
  isDarkMode?: boolean
}) {
  const [section, setSection] = useState<'invoices' | 'settings'>('invoices')

  return (
    <div className="space-y-6 font-sans text-crm-fg">
      {/* HEADER & SUBVIEW NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-crm-border pb-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-crm-fg">
            Fiscal & NFS-e <span className="text-crm-subtle">emissão de notas e conformidade tributária.</span>
          </h1>
          <p className="mt-1 text-[13px] text-crm-muted">
            Gestão de NFS-e transmitidas, impostos apurados e conciliação com contratos da ANXIS.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-crm-surface border border-crm-border">
          <button
            type="button"
            onClick={() => setSection('invoices')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              section === 'invoices'
                ? 'bg-crm-accent text-white shadow-xs font-semibold'
                : 'text-crm-muted hover:text-crm-fg hover:bg-crm-canvas'
            )}
          >
            <span>Notas e Emissão (6)</span>
          </button>
          <button
            type="button"
            onClick={() => setSection('settings')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              section === 'settings'
                ? 'bg-crm-accent text-white shadow-xs font-semibold'
                : 'text-crm-muted hover:text-crm-fg hover:bg-crm-canvas'
            )}
          >
            <span>Configurações de Transmissão</span>
          </button>
        </div>
      </div>

      {section === 'invoices' && (
        <FiscalInvoicesTab
          projects={projects}
          contracts={contracts}
          canView={canView}
          canIssue={canIssue}
        />
      )}

      {section === 'settings' && (
        <FiscalSettingsTab canEdit={canManageSettings} />
      )}
    </div>
  )
}
