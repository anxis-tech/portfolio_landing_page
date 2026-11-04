'use client'

import { cn } from '@/lib/utils'

interface ThemeToggleSwitchProps {
  isDarkMode: boolean
  onToggle: () => void
  className?: string
}

/**
 * ThemeToggleSwitch
 * Based on Madflows "fresh-fireant-15" (Uiverse.io)
 * Adapted to ANXIS design system palette (#2E3E4F, #182331, #fdfdfd)
 */
export function ThemeToggleSwitch({
  isDarkMode,
  onToggle,
  className,
}: ThemeToggleSwitchProps) {
  return (
    <label
      className={cn(
        'anxis-theme-toggle cursor-pointer select-none shrink-0 inline-block',
        isDarkMode ? 'dark-state' : 'light-state',
        className
      )}
      title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
    >
      <input
        type="checkbox"
        checked={!isDarkMode}
        onChange={onToggle}
        aria-label={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      />
      <span className="anxis-theme-slider" />
    </label>
  )
}
