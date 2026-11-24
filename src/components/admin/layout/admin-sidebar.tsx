'use client'

import { LayoutGroup, motion } from 'motion/react'
import { AnxisLogo, AnxisIcon } from '@/components/ui/anxis-logo'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen } from '@/components/admin/ui/icons'

export interface NavItemConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }> | unknown[] | unknown
  allowed: boolean
  badge?: number | string
}

export interface NavSectionConfig {
  title: string
  items: NavItemConfig[]
}

interface AdminSidebarProps {
  navSections: NavSectionConfig[]
  activeTab: string
  onSelectTab: (tabId: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  userProfile: UserProfileWithRole | null
  onLogout: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

function NavIcon({ icon, active }: { icon: NavItemConfig['icon']; active: boolean }) {
  const className = cn(
    'h-[17px] w-[17px] shrink-0 transition-colors duration-200',
    active ? 'text-crm-accent' : 'text-crm-subtle group-hover:text-crm-fg'
  )
  if (Array.isArray(icon)) return <HugeiconsIcon icon={icon as never} strokeWidth={1.6} className={className} />
  const Icon = icon as React.ComponentType<{ size?: number; className?: string }>
  return <Icon size={17} className={className} />
}

// Alterna claro/escuro com um trilho segmentado; o destaque desliza entre sol e lua.
function ThemeSwitch({ isDarkMode, onToggle, compact }: { isDarkMode: boolean; onToggle: () => void; compact: boolean }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={isDarkMode ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
        className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-crm-subtle hover:bg-crm-fg/[0.05] hover:text-crm-fg"
      >
        <HugeiconsIcon icon={isDarkMode ? Sun03Icon : Moon02Icon} size={16} strokeWidth={1.6} />
      </button>
    )
  }
  return (
    <div role="radiogroup" aria-label="Tema" className="relative grid h-8 grid-cols-2 rounded-lg border border-crm-border bg-crm-surface-2 p-0.5">
      {[
        { dark: false, icon: Sun03Icon, label: 'Claro' },
        { dark: true, icon: Moon02Icon, label: 'Escuro' },
      ].map((option) => {
        const selected = option.dark === isDarkMode
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => !selected && onToggle()}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium',
              selected ? 'text-crm-fg' : 'text-crm-subtle hover:text-crm-fg'
            )}
          >
            {selected && (
              <motion.span
                layoutId="crm-theme-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 -z-10 rounded-md border border-crm-border bg-crm-surface shadow-sm"
              />
            )}
            <HugeiconsIcon icon={option.icon} size={13} strokeWidth={1.8} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function AdminSidebar({
  navSections,
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isDarkMode,
  onToggleDarkMode,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed bottom-0 left-0 top-0 z-40 flex h-screen select-none flex-col justify-between bg-crm-canvas text-crm-muted transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex h-14 shrink-0 items-center', isCollapsed ? 'justify-center' : 'justify-between pl-4 pr-2')}>
        {isCollapsed ? (
          <button type="button" onClick={onToggleCollapse} className="rounded-lg p-1.5 hover:bg-crm-fg/[0.05]" title="Expandir menu">
            <AnxisIcon size={24} theme={isDarkMode ? 'dark' : 'light'} />
          </button>
        ) : (
          <>
            <AnxisLogo size="sm" iconSize={24} theme={isDarkMode ? 'dark' : 'light'} variant="crm" showText={false} />
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Recolher menu lateral"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-crm-subtle hover:bg-crm-fg/[0.05] hover:text-crm-fg"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        )}
      </div>

      <LayoutGroup id="crm-nav">
        <nav className="crm-no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2.5 pb-3 pt-1">
          {navSections.map((section, sectionIdx) => {
            const allowedItems = section.items.filter((item) => item.allowed)
            if (allowedItems.length === 0) return null
            const showTitle = !isCollapsed && Boolean(section.title) && !section.items.some((i) => i.id === 'dashboard')

            return (
              <div key={section.title || `section-${sectionIdx}`} className="space-y-0.5">
                {showTitle && <div className="px-2.5 pb-1 pt-1 text-[11px] font-medium text-crm-subtle">{section.title}</div>}
                {isCollapsed && sectionIdx > 0 && <div className="mx-auto mb-1.5 h-px w-6 bg-crm-border" />}

                {allowedItems.map((item) => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex w-full items-center rounded-lg text-[13px] transition-colors duration-200',
                        isCollapsed ? 'mx-auto h-9 w-9 justify-center' : 'h-8 justify-between px-2.5',
                        isActive ? 'font-medium text-crm-fg' : 'text-crm-muted hover:bg-crm-fg/[0.04] hover:text-crm-fg'
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="crm-nav-active"
                          transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                          className="absolute inset-0 rounded-lg border border-crm-border bg-crm-surface shadow-sm"
                        />
                      )}
                      <span className="relative flex min-w-0 items-center gap-2.5">
                        <NavIcon icon={item.icon} active={isActive} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </span>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={cn(
                            'relative min-w-5 rounded-md px-1.5 py-px text-center font-mono text-[10.5px] font-medium',
                            isActive ? 'bg-crm-accent text-white' : 'bg-crm-fg/[0.06] text-crm-muted'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isCollapsed && item.badge !== undefined && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-crm-accent ring-2 ring-crm-canvas" />
                      )}

                      {isCollapsed && (
                        <span className="pointer-events-none invisible absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-crm-border bg-crm-surface px-2.5 py-1.5 text-left text-xs opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                          <span className="block text-[10.5px] text-crm-subtle">{section.title}</span>
                          <span className="block font-medium text-crm-fg">{item.label}</span>
                          {item.badge !== undefined && <span className="mt-0.5 block font-mono text-[10.5px] text-crm-accent">{item.badge} itens</span>}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </LayoutGroup>

      <div className={cn('shrink-0 border-t border-crm-border p-2.5', isCollapsed && 'space-y-1')}>
        <ThemeSwitch isDarkMode={isDarkMode} onToggle={onToggleDarkMode} compact={isCollapsed} />
        {isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expandir menu lateral"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-crm-subtle hover:bg-crm-fg/[0.05] hover:text-crm-fg"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
