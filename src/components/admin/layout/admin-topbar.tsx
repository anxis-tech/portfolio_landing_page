'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { Search, Bell, Menu, ChevronDown, ChevronRight, LogOut } from '@/components/admin/ui/icons'
export const COPILOT_TOGGLE_EVENT = 'anxis:copilot-toggle';
export function CopilotAvatar({ className = '' }: { className?: string }) { return <img src='/images/copilot-avatar.png' alt='' aria-hidden className={`shrink-0 bg-[#161616] object-cover ${className}`} /> }

interface AdminTopbarProps {
  sectionTitle?: string
  pageTitle?: string
  isSidebarCollapsed: boolean
  onToggleSidebarMobile?: () => void
  onQuickAction?: () => void
  quickActionLabel?: string
  userProfile?: UserProfileWithRole | null
  onSearchClick?: () => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
  onLogout?: () => void
  isDarkMode?: boolean
  /** Mostra o botão do Copilot ao lado das notificações. */
  showCopilot?: boolean
}

const iconButton = 'flex h-8 w-8 items-center justify-center rounded-lg text-crm-subtle transition-colors hover:bg-crm-fg/[0.05] hover:text-crm-fg'

export function AdminTopbar({
  sectionTitle,
  pageTitle,
  isSidebarCollapsed,
  onToggleSidebarMobile,
  userProfile,
  onSearchClick,
  searchQuery,
  onSearchChange,
  onLogout,
  showCopilot = false,
}: AdminTopbarProps) {
  const [searchValue, setSearchValue] = useState(searchQuery || '')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // "/" focuses the search; ⌘K belongs to the Copilot.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    if (!isProfileOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    onSearchChange?.(e.target.value)
  }

  const firstName = userProfile?.full_name?.split(' ')[0] || 'Usuário'
  const initials =
    (userProfile?.full_name || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-14 select-none items-center justify-between gap-4 bg-crm-canvas pl-3 pr-3 text-crm-fg transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:pr-5 md:pl-2',
        isSidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-60'
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" onClick={onToggleSidebarMobile} className={cn(iconButton, 'md:hidden')} title="Abrir menu lateral">
          <Menu size={18} />
        </button>

        <nav aria-label="Você está em" className="hidden min-w-0 items-center gap-1.5 text-[13px] lg:flex">
          <span className="truncate text-crm-subtle">{sectionTitle}</span>
          {pageTitle && pageTitle !== sectionTitle && (
            <>
              <ChevronRight size={13} className="shrink-0 text-crm-subtle/70" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={pageTitle}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="truncate font-medium text-crm-fg"
                >
                  {pageTitle}
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </nav>

        <div className="relative w-full max-w-sm lg:ml-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-crm-subtle" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Buscar no sistema"
            className="h-8 w-full rounded-lg border border-crm-border bg-crm-surface pl-9 pr-10 text-[13px] text-crm-fg shadow-xs outline-none placeholder:text-crm-subtle hover:border-crm-border-strong"
            onClick={onSearchClick}
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded-md border border-crm-border bg-crm-surface-2 px-1.5 font-[family-name:var(--font-code)] text-[10.5px] text-crm-subtle sm:flex">
            /
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showCopilot && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(COPILOT_TOGGLE_EVENT))}
            className="group relative rounded-[10px] bg-gradient-to-r from-[#0a72f0]/70 via-white/15 to-[#0a72f0]/40 p-px shadow-xs transition-shadow hover:shadow-[0_0_10px_-4px_rgba(10,114,240,0.45)]"
            title="Abrir ANXIS Copilot (⌘K)"
          >
            <span className="flex h-[30px] items-center gap-1.5 rounded-[9px] bg-[#111111] pl-1 pr-1 text-[12.5px] font-medium text-white sm:pr-1.5">
              <CopilotAvatar className="h-6 w-6 rounded-[7px] transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">
                Copilot
              </span>
              <kbd className="hidden rounded border border-white/10 bg-white/[0.06] px-1 font-mono text-[10px] text-white/50 lg:inline">⌘K</kbd>
            </span>
          </button>
        )}
        <button type="button" className={iconButton} title="Notificações do sistema">
          <Bell size={17} />
        </button>

        <div className="mx-1.5 h-5 w-px bg-crm-border" />

        <div ref={profileDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-crm-fg/[0.05]"
            title={userProfile?.full_name || 'Usuário'}
            aria-expanded={isProfileOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crm-primary text-[11px] font-semibold text-white ring-2 ring-crm-surface">
              {initials}
            </span>
            <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-crm-fg xl:inline">{firstName}</span>
            <ChevronDown size={13} className={cn('hidden text-crm-subtle transition-transform xl:inline', isProfileOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-crm-border bg-crm-surface p-1.5 text-[13px] text-crm-fg shadow-xl"
              >
                <div className="mb-1 flex items-center gap-2.5 border-b border-crm-border px-2 pb-2.5 pt-1.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crm-primary text-[11.5px] font-semibold text-white">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{userProfile?.full_name || 'Usuário'}</span>
                    <span className="block truncate text-[11.5px] capitalize text-crm-subtle">
                      {userProfile?.role_name || userProfile?.role_slug || 'Membro da equipe'}
                    </span>
                  </span>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      onLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                  >
                    <LogOut size={15} />
                    Sair da conta
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
