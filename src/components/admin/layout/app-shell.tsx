'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AdminSidebar, NavSectionConfig } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { AlertCircle, X } from 'lucide-react'
import { NotificationViewport } from '@/components/admin/ui/notifications'

interface AppShellProps {
  navSections: NavSectionConfig[]
  activeTab: string
  onSelectTab: (tabId: string) => void
  userProfile: UserProfileWithRole | null
  onLogout: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  staleDeployDetected?: boolean
  onDismissStaleDeploy?: () => void
  sectionTitle: string
  pageTitle: string
  onQuickAction?: () => void
  quickActionLabel?: string
  isFullHeight?: boolean
  children: ReactNode
}

export function AppShell({
  navSections,
  activeTab,
  onSelectTab,
  userProfile,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  staleDeployDetected = false,
  onDismissStaleDeploy,
  sectionTitle,
  pageTitle,
  onQuickAction,
  quickActionLabel,
  isFullHeight = false,
  children,
}: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId)
    setIsMobileSidebarOpen(false)
  }

  return (
    <div
      className={cn(
        'h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-300',
        isDarkMode ? 'bg-[#0B132B] text-slate-100 dark' : 'bg-[#2E3E4F] text-[#0C1D36]'
      )}
    >
      <NotificationViewport isDarkMode={isDarkMode} />
      {/* STALE DEPLOY DETECTION BANNER */}
      {staleDeployDetected && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-amber-500 text-slate-950 rounded-xl px-4 py-2.5 shadow-2xl text-xs font-semibold max-w-md w-full animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
          <span className="flex-1">
            Nova versão do sistema disponível. Recarregue para continuar.
          </span>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-950 hover:bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
          >
            Recarregar
          </button>
          {onDismissStaleDeploy && (
            <button
              onClick={onDismissStaleDeploy}
              className="text-slate-950/70 hover:text-slate-950 transition-colors p-0.5"
              title="Fechar aviso"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (DESKTOP + MOBILE DRAWER) */}
      <div
        className={cn(
          'transition-transform duration-300 z-50',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <AdminSidebar
          navSections={navSections}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          userProfile={userProfile}
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
      </div>

      {/* TOPBAR */}
      <AdminTopbar
        sectionTitle={sectionTitle}
        pageTitle={pageTitle}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen((prev) => !prev)}
        onQuickAction={onQuickAction}
        quickActionLabel={quickActionLabel}
        userProfile={userProfile}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
      />

      {/* MAIN MODULE CONTENT AREA */}
      <div
        className={cn(
          'flex-1 pt-14 transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-60',
          isDarkMode ? 'bg-[#0B132B]' : 'bg-[#2E3E4F]'
        )}
      >
        <main
          className={cn(
            'w-full md:rounded-tl-lg',
            !isDarkMode ? 'bg-[#fdfdfd]' : 'bg-[#0B0F19]',
            isFullHeight
              ? 'h-[calc(100vh-56px)] overflow-hidden p-0'
              : 'h-[calc(100vh-56px)] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
