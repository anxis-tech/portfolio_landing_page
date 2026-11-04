'use client'

import { useState } from 'react'
import type { ClientProject } from '@/types/client-project.types'
import type { Contract } from '@/types/contract.types'
import { FiscalInvoicesTab } from './fiscal-invoices-tab'
import { FiscalSettingsTab } from './fiscal-settings-tab'

export function FiscalWorkspaceTab({ projects, contracts, canView, canIssue, canManageSettings }: {
  projects: ClientProject[]
  contracts: Contract[]
  canView: boolean
  canIssue: boolean
  canManageSettings: boolean
}) {
  const canAccessInvoices = canView || canIssue
  const [section, setSection] = useState<'invoices' | 'settings'>(canAccessInvoices ? 'invoices' : 'settings')
  const visibleSection = section === 'invoices' && !canAccessInvoices ? 'settings' : section === 'settings' && !canManageSettings ? 'invoices' : section
  return <div className="space-y-5">
    {canAccessInvoices && canManageSettings && <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800"><button type="button" onClick={() => setSection('invoices')} className={visibleSection === 'invoices' ? 'rounded-lg bg-[#2E3E4F] px-3 py-2 text-xs font-bold text-white' : 'rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold'}>Notas e emissão</button><button type="button" onClick={() => setSection('settings')} className={visibleSection === 'settings' ? 'rounded-lg bg-[#2E3E4F] px-3 py-2 text-xs font-bold text-white' : 'rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold'}>Configurações</button></div>}
    {visibleSection === 'invoices' && canAccessInvoices && <FiscalInvoicesTab projects={projects} contracts={contracts} canView={canView} canIssue={canIssue} />}
    {visibleSection === 'settings' && canManageSettings && <FiscalSettingsTab canEdit />}
  </div>
}
