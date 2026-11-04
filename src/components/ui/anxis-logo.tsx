'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function AnxisIcon({
  size = 28,
  theme = 'light',
  className,
}: {
  size?: number
  theme?: 'dark' | 'light'
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 transition-transform duration-300', className)}
    >
      <defs>
        <linearGradient id="logoipsum-crm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoipsum-crm-grad)" fillOpacity="0.15" />
      <path
        d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23"
        stroke="url(#logoipsum-crm-grad)"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.25" fill="#38BDF8" />
      <circle cx="21.5" cy="10.5" r="2" fill="#818CF8" />
      <circle cx="10.5" cy="21.5" r="2" fill="#38BDF8" />
    </svg>
  )
}

export function AnxisLogo({
  size = 'md',
  iconSize = size === 'sm' ? 24 : size === 'md' ? 28 : 34,
  theme = 'light',
  variant = 'crm',
  showText = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  iconSize?: number
  theme?: 'dark' | 'light'
  variant?: 'default' | 'crm'
  showText?: boolean
  className?: string
}) {
  const textSize =
    size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'

  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      <AnxisIcon size={iconSize} theme={theme} className="group-hover:scale-105" />
      {showText && (
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={cn(
              'font-black tracking-tight leading-none',
              textSize,
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            logo<span className="text-sky-400">ipsum</span>
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            CRM
          </span>
        </div>
      )}
    </div>
  )
}
