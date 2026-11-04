'use client'
import { CRMLoginView } from "@/components/admin/auth/crm-login-view";

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/admin/layout/app-shell'
import { DashboardOverviewTab } from '@/components/admin/tabs/dashboard-overview-tab'
import { HomePortfolioTab } from '@/components/admin/tabs/home-portfolio-tab'
import { ClientProjectsTab } from '@/components/admin/tabs/client-projects-tab'
import { KanbanBoardTab } from '@/components/admin/tabs/kanban-board-tab'
import { PricingCalculatorTab } from '@/components/admin/tabs/pricing-calculator-tab'
import { PricingSettingsTab } from '@/components/admin/tabs/pricing-settings-tab'
import { QuotesTab } from '@/components/admin/tabs/quotes-tab'
import { UsersPermissionsTab } from '@/components/admin/tabs/users-permissions-tab'
import { FinanceTab } from '@/components/admin/tabs/finance-tab'
import { CommissionsSubtab } from '@/components/admin/tabs/commissions-subtab'
import { FiscalWorkspaceTab } from '@/components/admin/tabs/fiscal-workspace-tab'
import { FiscalSettingsTab } from '@/components/admin/tabs/fiscal-settings-tab'
import { ProjectFiscalPanel } from '@/components/admin/project-fiscal-panel'
import { ProjectChargesPanel } from '@/components/admin/project-charges-panel'
import { ConversationsTab } from '@/components/admin/conversations/conversations-tab'
import { notify } from '@/components/admin/ui/notifications'
import {
  MOCK_USER_PROFILE,
  MOCK_TEAM_DIRECTORY,
  MOCK_CLIENT_PROJECTS,
  MOCK_SAVED_QUOTES,
  MOCK_HOME_PROJECTS,
} from '@/components/admin/mock-crm-data'
import { ClientProject } from '@/types/client-project.types'
import { SavedQuote, QuoteFormData } from '@/types/pricing.types'
import { Project } from '@/types/database.types'
import { Contract } from '@/types/contract.types'
import { Payment } from '@/types/payment.types'
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  Globe02Icon,
  FolderKanbanIcon,
  KanbanIcon,
  Calculator01Icon,
  Shield01Icon,
  ExternalLinkIcon,
  File01Icon,
  Attachment01Icon,
  Link01Icon,
  Download01Icon,
  Mail01Icon,
  BubbleChatIcon,
  UserIcon,
  Calendar01Icon,
  Task01Icon,
  Delete02Icon,
  Dollar01Icon,
  PieChartIcon,
  Settings01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'


function safeGetStorage(key: string): string | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [userProfile] = useState(MOCK_USER_PROFILE)
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [homeProjects, setHomeProjects] = useState<Project[]>(MOCK_HOME_PROJECTS)
  const [clientProjects, setClientProjects] = useState<ClientProject[]>(MOCK_CLIENT_PROJECTS)
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(MOCK_SAVED_QUOTES)
  const [teamUsers, setTeamUsers] = useState<any[]>(MOCK_TEAM_DIRECTORY)
  const [calculatorInitialData, setCalculatorInitialData] = useState<QuoteFormData | undefined>()
  const [calculatorSourceQuote, setCalculatorSourceQuote] = useState<SavedQuote | undefined>()
  const [prefilledFromQuote, setPrefilledFromQuote] = useState<SavedQuote | null>(null)
  const [selectedDetailProject, setSelectedDetailProject] = useState<ClientProject | null>(null)
  const [isContractDetailReadOnly, setIsContractDetailReadOnly] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'geral' | 'contato' | 'escopo' | 'orcamento_escopo' | 'links_arquivos' | 'contrato' | 'pagamento' | 'fiscal'>('geral')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isEmbedded, setIsEmbedded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isEmbedParam = new URLSearchParams(window.location.search).get('embed') === 'true'
        const isFramed = window.self !== window.top
        return isEmbedParam || isFramed
      } catch {
        return true
      }
    }
    return false
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)

  useEffect(() => {
    const savedTheme = safeGetStorage('logoipsum_admin_theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const requestedTab = searchParams.get('tab')
      if (requestedTab) setActiveTab(requestedTab)
      const isEmbedParam = searchParams.get('embed') === 'true'
      const isFramed = window.self !== window.top
      setIsEmbedded(isEmbedParam || isFramed)

      const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'CHANGE_CRM_TAB' && typeof e.data.tab === 'string') {
          setActiveTab(e.data.tab)
        }
      }
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [])

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      safeSetStorage('logoipsum_admin_theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      safeSetStorage('logoipsum_admin_theme', 'light')
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  const handleDeleteProjectFromDrawer = (projectId: string, projectTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${projectTitle}"? (Modo Vitrine)`)) {
      setClientProjects((prev) => prev.filter((p) => p.id !== projectId))
      setSelectedDetailProject(null)
      notify.success(`Projeto "${projectTitle}" excluído com sucesso!`)
    }
  }

  const handleContinueToProjectForm = (quote: SavedQuote) => {
    setCalculatorInitialData(quote.form_data)
    setCalculatorSourceQuote(quote)
    setActiveTab('pricing_calculator')
  }

  const navSections = [
    {
      title: 'Dashboard',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: DashboardSquare01Icon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Gestão / Execução',
      items: [
        {
          id: 'kanban_board',
          label: 'Workspace',
          icon: KanbanIcon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Comercial',
      items: [
        {
          id: 'conversations',
          label: 'Conversas',
          icon: BubbleChatIcon,
          allowed: true,
        },
        {
          id: 'client_projects',
          label: 'Projetos',
          icon: FolderKanbanIcon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Orçamentos',
      items: [
        {
          id: 'pricing_calculator',
          label: 'Precificação',
          icon: Calculator01Icon,
          allowed: true,
        },
        {
          id: 'quotes_history',
          label: 'Histórico',
          icon: File01Icon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Conteúdo & Website',
      items: [
        {
          id: 'portfolio_home',
          label: 'Portfólio',
          icon: Globe02Icon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        {
          id: 'finance_overview',
          label: 'Financeiro',
          icon: Dollar01Icon,
          allowed: true,
        },
        {
          id: 'commissions_overview',
          label: 'Comissões',
          icon: PieChartIcon,
          allowed: true,
        },
      ],
    },
    {
      title: 'Configurações',
      items: [
        {
          id: 'users_permissions',
          label: 'Permissões',
          icon: Shield01Icon,
          allowed: true,
        },
        {
          id: 'fiscal_settings',
          label: 'Fiscal',
          icon: File01Icon,
          allowed: true,
        },
        {
          id: 'pricing_rules',
          label: 'Regras de Precificação',
          icon: Settings01Icon,
          allowed: true,
        },
      ],
    },
  ]

  const allAllowedTabs = navSections.flatMap((s) => s.items)
  const currentTabObj = allAllowedTabs.find((t) => t.id === activeTab)
  const currentSection = navSections.find((s) => s.items.some((i) => i.id === activeTab)) || navSections[0]

  if (!isAuthenticated) {
    return (
      <CRMLoginView
        onSuccessLogin={() => setIsAuthenticated(true)}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <AppShell
      navSections={navSections}
      activeTab={activeTab}
      onSelectTab={(tabId) => {
        setActiveTab(tabId)
        window.history.replaceState(null, '', `/crm?tab=${encodeURIComponent(tabId)}`)
      }}
      userProfile={userProfile}
      onLogout={handleLogout}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      sectionTitle={currentSection?.title || 'Administrativo'}
      pageTitle={currentTabObj?.label || 'Dashboard'}
      isFullHeight={activeTab === 'conversations'}
      onQuickAction={() => {
        setPrefilledFromQuote(null)
        setActiveTab('client_projects')
      }}
      quickActionLabel="Novo Projeto"
    >
      {/* RETORNAR AO PORTFÓLIO BANNER (SOMENTE EM MODO STANDALONE, OCULTO SE EMBEDDED) */}
      {!isEmbedded && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 bg-neutral-900/90 hover:bg-neutral-900 text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 text-xs font-semibold backdrop-blur-md transition-all hover:scale-105"
          >
            <span>← Voltar ao Portfólio</span>
          </Link>
        </div>
      )}

      {/* TAB 0: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <DashboardOverviewTab
          projects={clientProjects}
          userProfile={userProfile}
          onOpenProjectDetail={(p) => {
            setSelectedDetailProject(p)
            setIsContractDetailReadOnly(false)
            setDrawerTab('geral')
          }}
          onNavigateToTab={(tId) => setActiveTab(tId)}
          onOpenCreateModal={() => setActiveTab('client_projects')}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 1: PORTFÓLIO DA HOME */}
      {activeTab === 'portfolio_home' && (
        <HomePortfolioTab
          projects={homeProjects}
          onUpdateProjects={setHomeProjects}
          canEdit={true}
          canDelete={true}
          canCreate={true}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 2: PROJETOS DE CLIENTES */}
      {activeTab === 'client_projects' && (
        <ClientProjectsTab
          projects={clientProjects}
          onUpdateProjects={setClientProjects}
          userProfile={userProfile}
          teamUsers={teamUsers}
          canCreate={true}
          canEdit={true}
          canDelete={true}
          canAssignResponsible={true}
          canViewAll={true}
          onOpenProjectDetail={(p, options) => {
            setSelectedDetailProject(p)
            setIsContractDetailReadOnly(Boolean(options?.readOnly))
            setDrawerTab('geral')
          }}
          prefilledFromQuote={prefilledFromQuote}
          onClearPrefilledQuote={() => setPrefilledFromQuote(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 3: KANBAN DE PROJETOS */}
      {activeTab === 'kanban_board' && (
        <KanbanBoardTab
          projects={clientProjects}
          onUpdateProjects={setClientProjects}
          userProfile={userProfile}
          canMoveKanban={true}
          canViewAll={true}
          onOpenProjectDetail={(p) => {
            setSelectedDetailProject(p)
            setIsContractDetailReadOnly(false)
            setDrawerTab('geral')
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 4: HISTÓRICO DE ORÇAMENTOS */}
      {activeTab === 'quotes_history' && (
        <QuotesTab
          quotes={savedQuotes}
          onUpdateQuotes={setSavedQuotes}
          onEditQuoteInCalculator={(quote) => {
            setCalculatorInitialData(quote.form_data)
            setCalculatorSourceQuote(quote)
            setActiveTab('pricing_calculator')
          }}
          onConvertToProject={handleContinueToProjectForm}
          onOpenCreateQuote={() => setActiveTab('pricing_calculator')}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 5: CALCULADORA DE PRECIFICAÇÃO */}
      {activeTab === 'pricing_calculator' && (
        <PricingCalculatorTab
          canSaveQuote={true}
          canCreateProject={true}
          teamUsers={teamUsers}
          sourceQuote={calculatorSourceQuote}
          onSourceQuoteConsumed={() => setCalculatorSourceQuote(undefined)}
          onSaveQuote={(quote) => {
            setSavedQuotes((prev) => [quote, ...prev])
            setActiveTab('quotes_history')
          }}
          onProjectCreated={(project) => {
            setClientProjects((prev) => [project, ...prev])
            setActiveTab('client_projects')
          }}
          initialData={calculatorInitialData}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 6: CONVERSAS / WHATSAPP */}
      {activeTab === 'conversations' && (
        <ConversationsTab
          userProfile={userProfile}
          canManage={true}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 7: FINANCEIRO */}
      {activeTab === 'finance_overview' && (
        <FinanceTab
          projects={clientProjects}
          quotes={savedQuotes}
          contracts={[]}
          payments={[]}
          teamUsers={teamUsers}
          userProfile={userProfile}
          canViewValues={true}
          canViewPayments={true}
          onOpenProjectDetail={(p) => {
            setSelectedDetailProject(p)
            setIsContractDetailReadOnly(false)
            setDrawerTab('geral')
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 8: COMISSÕES */}
      {activeTab === 'commissions_overview' && (
        <CommissionsSubtab
          projects={clientProjects}
          teamUsers={teamUsers}
          userProfile={userProfile}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 9: PERMISSÕES & USUÁRIOS */}
      {activeTab === 'users_permissions' && (
        <UsersPermissionsTab
          userProfile={userProfile}
          canManageRoles={true}
          canManagePermissions={true}
          isDarkMode={isDarkMode}
        />
      )}

      {/* TAB 10: CONFIGURAÇÕES FISCAIS */}
      {activeTab === 'fiscal_settings' && (
        <div className="space-y-6">
          <FiscalWorkspaceTab isDarkMode={isDarkMode} />
          <FiscalSettingsTab isDarkMode={isDarkMode} />
        </div>
      )}

      {/* TAB 11: REGRAS DE PRECIFICAÇÃO */}
      {activeTab === 'pricing_rules' && (
        <PricingSettingsTab
          canManageSettings={true}
          isDarkMode={isDarkMode}
        />
      )}

      {/* DRAWER LATERAL DE DETALHES DO PROJETO (HERDADO 100% INTACTO DO ANXIS) */}
      {selectedDetailProject && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDetailProject(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E1528] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* CABEÇALHO DO DRAWER */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-[#0E1528]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-500/20">
                  {selectedDetailProject.project_type}
                </span>
                <h3 className="text-xl font-bold text-[#0C1D36] dark:text-white mt-1.5 leading-snug">
                  {selectedDetailProject.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedDetailProject.company || selectedDetailProject.client_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailProject(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* ABAS DO DRAWER */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-2 bg-white dark:bg-[#0E1528] overflow-x-auto text-xs font-semibold">
              {[
                { id: 'geral', label: 'Visão Geral' },
                { id: 'contato', label: 'Contato' },
                { id: 'escopo', label: 'Briefing' },
                { id: 'orcamento_escopo', label: 'Orçamento' },
                { id: 'links_arquivos', label: 'Arquivos' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as any)}
                  className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === tab.id
                      ? 'border-[#2E3E4F] dark:border-sky-400 text-[#2E3E4F] dark:text-sky-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CORPO DO DRAWER */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerTab === 'geral' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status & Prazos</span>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                      <span>Status do Projeto:</span>
                      <span className="font-bold text-[#2E3E4F] dark:text-sky-400">{selectedDetailProject.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                      <span>Prioridade:</span>
                      <span className="font-bold">{selectedDetailProject.priority}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                      <span>Responsável:</span>
                      <span className="font-bold">{selectedDetailProject.responsible_user_name || 'Não atribuído'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 dark:text-slate-200">
                      <span>Prazo de Entrega:</span>
                      <span className="font-bold">{selectedDetailProject.deadline || '-'}</span>
                    </div>
                  </div>

                  {selectedDetailProject.description && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedDetailProject.description}</p>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'contato' && (
                <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliente:</span>
                    <span className="font-bold dark:text-white">{selectedDetailProject.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">E-mail:</span>
                    <span className="font-bold text-sky-500">{selectedDetailProject.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telefone / WhatsApp:</span>
                    <span className="font-bold dark:text-white">{selectedDetailProject.phone || selectedDetailProject.whatsapp || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Empresa:</span>
                    <span className="font-bold dark:text-white">{selectedDetailProject.company || '-'}</span>
                  </div>
                </div>
              )}

              {drawerTab === 'escopo' && (
                <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-1">Objetivo:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedDetailProject.scope_briefing_json?.objective || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Público-Alvo:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedDetailProject.scope_briefing_json?.target_audience || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'orcamento_escopo' && (
                <div className="space-y-4 text-xs bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="font-bold text-sm text-[#0C1D36] dark:text-white">Resumo Financeiro</span>
                    <span className="text-emerald-500 font-bold">
                      R$ {selectedDetailProject.approved_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condição:</span>
                    <span className="font-medium dark:text-slate-200">
                      {typeof selectedDetailProject.payment_condition === 'string'
                        ? selectedDetailProject.payment_condition
                        : selectedDetailProject.payment_condition?.description || '50% entrada + 50% entrega'}
                    </span>
                  </div>
                </div>
              )}

              {drawerTab === 'links_arquivos' && (
                <div className="space-y-2 text-xs">
                  {selectedDetailProject.files?.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-6">Nenhum arquivo enviado.</p>
                  ) : (
                    selectedDetailProject.files?.map((file) => (
                      <div key={file.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold dark:text-white">{file.file_name}</span>
                        <span className="text-[10px] text-slate-400">{file.category}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RODAPÉ DO DRAWER */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#0E1528]">
              <button
                onClick={() => handleDeleteProjectFromDrawer(selectedDetailProject.id, selectedDetailProject.title)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" strokeWidth={1.5} />
                <span>Excluir</span>
              </button>
              <button
                onClick={() => setSelectedDetailProject(null)}
                className="px-4 py-2 bg-[#2E3E4F] dark:bg-sky-500 text-white rounded-xl text-xs font-bold hover:opacity-90"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
