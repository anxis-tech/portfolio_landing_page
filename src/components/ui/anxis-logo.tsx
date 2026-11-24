'use client'

import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'

const crmBrandFont = Poppins({
  weight: '900',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

interface AnxisIconProps {
  size?: number
  theme?: 'dark' | 'light'
  className?: string
}

export function AnxisIcon({ size = 32, theme = 'light', className }: AnxisIconProps) {
  return (
    <Image
      src="/images/anxis-logo.svg"
      alt="Logo da ANXIS"
      width={size}
      height={size}
      unoptimized
      draggable={false}
      style={{ width: size, height: size }}
      className={cn('shrink-0 object-contain drop-shadow-sm', theme === 'dark' && 'brightness-0 invert', className)}
    />
  )
}

interface AnxisLogoProps {
  size?: 'sm' | 'md' | 'lg'
  iconSize?: number
  theme?: 'dark' | 'light'
  variant?: 'default' | 'crm'
  showText?: boolean
  className?: string
}

export function AnxisLogo({ size = 'md', iconSize = size === 'sm' ? 24 : size === 'md' ? 30 : 38, theme = 'light', variant = 'default', showText = true, className }: AnxisLogoProps) {
  const textSize = variant === 'crm'
    ? size === 'sm' ? 'text-[20px]' : size === 'md' ? 'text-[24px]' : 'text-[30px]'
    : size === 'sm' ? 'text-lg tracking-wider' : size === 'md' ? 'text-xl tracking-widest' : 'text-2xl tracking-widest'

  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      <AnxisIcon size={iconSize} theme={theme} className="transition-transform duration-300 group-hover:scale-105" />
      {showText && (
        <span
          className={cn(
            'font-black leading-none',
            variant === 'crm' ? cn(crmBrandFont.className, 'tracking-[-0.05em]') : 'font-heading',
            textSize,
            theme === 'dark' ? 'text-white' : 'text-[#0F172A]'
          )}
        >
          {variant === 'crm' ? 'anxis' : 'ANXIS'}
        </span>
      )}
    </div>
  )
}
