'use client'

import { AnxisLogo, AnxisIcon } from '@/components/ui/anxis-logo'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { cn } from '@/lib/utils'
import {
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { ThemeToggleSwitch } from '@/components/ui/theme-toggle-switch'

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

export function AdminSidebar({
  navSections,
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  userProfile,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between transition-all duration-300 ease-in-out select-none',
        isDarkMode
          ? 'bg-[#0B132B] text-slate-300'
          : 'bg-[#2E3E4F] text-slate-200',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* TOP SECTION: BRAND LOGO */}
      <div
        className={cn(
          'h-14 shrink-0 flex items-center px-3.5',
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 hover:scale-105 transition-transform cursor-pointer"
            title="Expandir menu"
          >
            <AnxisIcon size={26} theme="dark" />
          </button>
        ) : (
          <div className="flex items-center">
            <AnxisLogo size="md" theme="dark" variant="crm" />
          </div>
        )}
      </div>

      {/* NAVIGATION LIST (flex-1 so it takes all available vertical space naturally) */}
      <nav className="flex-1 min-h-0 p-2 space-y-3.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/50">
        {navSections.map((section, sectionIdx) => {
          const allowedItems = section.items.filter((item) => item.allowed)
          if (allowedItems.length === 0) return null

          const isDashboardSection = section.items.some((i) => i.id === 'dashboard')

          return (
            <div
              key={section.title || `section-${sectionIdx}`}
              className={cn(
                'space-y-0.5',
                isDashboardSection && cn(
                  'pb-2.5 border-b',
                  isDarkMode ? 'border-slate-700/60' : 'border-white/15'
                )
              )}
            >
              {!isCollapsed && Boolean(section.title) && (
                <div className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider px-2.5 pt-2 pb-1',
                  isDarkMode ? 'text-slate-400/70' : 'text-slate-300/70'
                )}>
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {allowedItems.map((item) => {
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      className={cn(
                        'w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer group relative',
                        isCollapsed
                          ? 'justify-center h-9 w-9 mx-auto'
                          : 'justify-between px-2.5 py-1.5',
                        isActive
                          ? isDarkMode
                            ? 'bg-[#1E293B] text-white font-semibold shadow-xs'
                            : 'bg-[#182331] text-white font-semibold shadow-xs'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                            : 'text-slate-300 hover:text-white hover:bg-[#182331]/50'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {Array.isArray(item.icon) ? (
                          <HugeiconsIcon
                            icon={item.icon as never}
                            strokeWidth={1.5}
                            className={cn(
                              'w-4 h-4 shrink-0 transition-colors',
                              isActive
                                ? 'text-white'
                                : isDarkMode
                                  ? 'text-slate-400 group-hover:text-slate-200'
                                  : 'text-slate-300 group-hover:text-white'
                            )}
                          />
                        ) : (
                          (() => {
                            const LucideIcon = item.icon as React.ComponentType<{
                              size?: number
                              className?: string
                            }>
                            return (
                              <LucideIcon
                                size={16}
                                className={cn(
                                  'shrink-0 transition-colors',
                                  isActive
                                    ? 'text-white'
                                    : isDarkMode
                                      ? 'text-slate-400 group-hover:text-slate-200'
                                      : 'text-slate-300 group-hover:text-white'
                                )}
                              />
                            )
                          })()
                        )}
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                            isActive
                              ? 'bg-white/20 text-white font-semibold'
                              : isDarkMode
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-[#182331] text-slate-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {!isCollapsed && isActive && item.badge === undefined && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                      )}

                      {/* FLOATING TOOLTIP WHEN SIDEBAR IS COMPACT */}
                      {isCollapsed && (
                        <div className={cn(
                          'absolute left-full ml-3 px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow-2xl border pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap text-left',
                          isDarkMode
                            ? 'bg-[#161D31] text-white border-slate-700/80'
                            : 'bg-[#182331] text-white border-[#2E3E4F]'
                        )}>
                          <div className={cn(
                            'text-[9px] font-normal uppercase tracking-wider',
                            isDarkMode ? 'text-slate-400' : 'text-slate-300/70'
                          )}>
                            {section.title}
                          </div>
                          <div className="text-white font-bold">{item.label}</div>
                          {item.badge !== undefined && (
                            <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                              {item.badge} itens
                            </div>
                          )}
                          <div className={cn(
                            'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent',
                            isDarkMode ? 'border-r-[#161D31]' : 'border-r-[#182331]'
                          )} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* BOTTOM SECTION: THEME TOGGLE & COLLAPSE */}
      <div
        className={cn(
          'shrink-0 p-2 border-t',
          isDarkMode
            ? 'bg-[#080E20] border-slate-800/80'
            : 'bg-[#182331] border-[#182331]/40',
          isCollapsed ? 'space-y-1.5' : 'flex items-center justify-between'
        )}
      >
        {/* THEME TOGGLE (UIVERSE SWITCH ADAPTED TO ANXIS PALETTE) */}
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center mx-auto' : 'px-1 py-1'
          )}
        >
          <ThemeToggleSwitch
            isDarkMode={isDarkMode}
            onToggle={onToggleDarkMode}
          />
        </div>

        {/* COLLAPSE / EXPAND TOGGLE */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'flex items-center justify-center rounded-lg transition-colors cursor-pointer',
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              : 'text-slate-300 hover:text-white hover:bg-[#2E3E4F]/70',
            isCollapsed ? 'h-8 w-8 mx-auto' : 'p-1.5'
          )}
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={16} className="shrink-0" />
          ) : (
            <PanelLeftClose size={16} className="shrink-0" />
          )}
        </button>
      </div>
    </aside>
  )
}
