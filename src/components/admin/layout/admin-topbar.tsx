'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import {
  Search,
  Bell,
  Menu,
  Command,
  HelpCircle,
  ChevronDown,
  LogOut,
} from 'lucide-react'

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
}

export function AdminTopbar({
  isSidebarCollapsed,
  onToggleSidebarMobile,
  userProfile,
  onSearchClick,
  searchQuery,
  onSearchChange,
  onLogout,
  isDarkMode = false,
}: AdminTopbarProps) {
  const [searchValue, setSearchValue] = useState(searchQuery || '')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // ⌘K global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
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

  return (
    <header
      className={cn(
        'h-14 fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out flex items-center justify-between pl-4 md:pl-0 pr-4 sm:pr-6 lg:pr-8 select-none',
        isDarkMode
          ? 'bg-[#0B132B] text-slate-200'
          : 'bg-[#2E3E4F] text-slate-100',
        isSidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-60'
      )}
    >
      {/* LEFT: MOBILE TOGGLE & SEARCH BAR (IN PLACE OF BREADCRUMB) */}
      <div className="flex items-center gap-3 flex-1 min-w-0 max-w-sm sm:max-w-md">
        <button
          type="button"
          onClick={onToggleSidebarMobile}
          className={cn(
            'p-1.5 rounded-lg md:hidden transition-colors cursor-pointer shrink-0',
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-300 hover:text-white hover:bg-[#182331]/60'
          )}
          title="Abrir menu lateral"
        >
          <Menu size={18} />
        </button>

        {/* SEARCH BAR (HUBSPOT STYLE WITH ⌘K) */}
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Buscar no sistema (⌘K)..."
            className={cn(
              'w-full h-8 pl-8 pr-12 rounded-lg text-xs transition-all outline-none border',
              isDarkMode
                ? 'bg-slate-900/90 border-slate-700/70 text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:ring-1 focus:ring-slate-500'
                : 'bg-[#182331] border-[#182331] text-slate-100 placeholder:text-slate-400 focus:border-[#2E3E4F] focus:ring-1 focus:ring-[#182331]'
            )}
            onClick={onSearchClick}
          />
          <div
            className={cn(
              'absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none text-[10px] font-mono px-1 py-0.5 rounded border',
              isDarkMode
                ? 'text-slate-400 bg-slate-800 border-slate-700'
                : 'text-slate-300 bg-[#2E3E4F] border-[#243240]'
            )}
          >
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* RIGHT: NOTIFICATIONS, HELP, SUBTLE DIVIDER & USER PROFILE DROPDOWN */}
      <div className="flex items-center gap-2 shrink-0">
        {/* NOTIFICATIONS BELL */}
        <button
          type="button"
          className={cn(
            'relative p-2 rounded-lg transition-colors cursor-pointer',
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-300 hover:text-white hover:bg-[#182331]/60'
          )}
          title="Notificações do sistema"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
        </button>

        {/* HELP / ASSISTANT */}
        <button
          type="button"
          className={cn(
            'p-2 rounded-lg transition-colors hidden sm:inline-flex cursor-pointer',
            isDarkMode
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-300 hover:text-white hover:bg-[#182331]/60'
          )}
          title="Central de Ajuda"
        >
          <HelpCircle size={16} />
        </button>

        {/* SUBTLE VERTICAL DIVIDER */}
        <div
          className={cn(
            'h-5 w-px mx-1',
            isDarkMode ? 'bg-slate-700/60' : 'bg-white/15'
          )}
        />

        {/* USER PROFILE DROPDOWN */}
        <div ref={profileDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className={cn(
              'flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer',
              isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-[#182331]/60'
            )}
            title={userProfile?.full_name || 'Usuário'}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1',
                isDarkMode
                  ? 'bg-slate-800 ring-white/10'
                  : 'bg-[#182331] ring-white/10'
              )}
            >
              {userProfile?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-100 hidden xl:inline max-w-[120px] truncate">
              {userProfile?.full_name?.split(' ')[0] || 'Usuário'}
            </span>
            <ChevronDown size={12} className={cn('hidden xl:inline', isDarkMode ? 'text-slate-400' : 'text-slate-300')} />
          </button>

          {isProfileOpen && (
            <div
              className={cn(
                'absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl p-2 z-50 text-xs animate-in fade-in-50 zoom-in-95',
                isDarkMode
                  ? 'bg-[#161D31] border-slate-700/80 text-slate-200'
                  : 'bg-[#182331] border-[#2E3E4F] text-slate-100'
              )}
            >
              <div className={cn('px-2 py-1.5 border-b mb-1', isDarkMode ? 'border-slate-800' : 'border-[#2E3E4F]')}>
                <div className="font-bold text-white truncate">{userProfile?.full_name || 'Usuário'}</div>
                <div className={cn('text-[10px] capitalize', isDarkMode ? 'text-slate-400' : 'text-slate-300/80')}>
                  {userProfile?.role_name || userProfile?.role_slug || 'Membro da equipe'}
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false)
                    onLogout()
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sair da conta</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
