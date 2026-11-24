'use client'

// Peças visuais compartilhadas do CRM. Usam os tokens `crm-*` (app/crm.css), então valem nos dois temas.

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Sparkline } from './charts'

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'violet'

const TONE_DOT: Record<Tone, string> = {
  neutral: 'bg-crm-subtle',
  accent: 'bg-crm-accent',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  violet: 'bg-violet-500',
}

const TONE_BADGE: Record<Tone, string> = {
  neutral: 'bg-crm-fg/[0.05] text-crm-muted ring-crm-fg/[0.08]',
  accent: 'bg-crm-accent/10 text-crm-accent ring-crm-accent/20',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400',
  violet: 'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-400',
}

/** Conta de 0 até o valor ao aparecer; sem animação para quem pediu menos movimento. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('pt-BR') }: { value: number; format?: (n: number) => string }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (reduce) return
    const start = performance.now()
    const origin = from.current
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(origin + (value - origin) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, reduce])

  return <>{format(reduce ? value : shown)}</>
}

export function Badge({ tone = 'neutral', dot = false, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium ring-1 ring-inset', TONE_BADGE[tone], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT[tone])} />}
      {children}
    </span>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  /** Texto pequeno à direita do número (ex.: "ativos", "de 10"). */
  suffix?: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: Tone
  loading?: boolean
  format?: (n: number) => string
  /** 0–1: barra fina de progresso no rodapé do cartão. */
  progress?: number
  /** Variação contra o período anterior; `goodWhenUp` decide se subir é verde ou vermelho. */
  delta?: { pct: number | null; label: string; goodWhenUp?: boolean }
  /** Série curta desenhada como mini gráfico ao lado do número. */
  spark?: number[]
  onClick?: () => void
  title?: string
  className?: string
}

export function StatCard({ label, value, suffix, hint, icon, tone = 'neutral', loading, format, progress, delta, spark, onClick, title, className }: StatCardProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-crm-border bg-crm-surface p-5 text-left shadow-sm',
        onClick && 'cursor-pointer transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-px hover:border-crm-border-strong hover:shadow-md',
        className
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-crm-muted">{label}</span>
        {spark && spark.length > 1 ? (
          <Sparkline values={spark} className="-my-2 h-7 w-20 shrink-0 opacity-80" />
        ) : (
          icon && <span className="text-crm-subtle transition-colors group-hover:text-crm-fg [&_svg]:h-[17px] [&_svg]:w-[17px]">{icon}</span>
        )}
      </span>
      <span className="mt-3 flex items-end justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="text-[clamp(22px,2.2vw,30px)] font-semibold leading-none tracking-[-0.035em] tabular-nums text-crm-fg">
            {loading ? <span className="crm-shimmer inline-block h-7 w-14 rounded-md align-middle" /> : typeof value === 'number' ? <AnimatedNumber value={value} format={format} /> : value}
          </span>
          {suffix && <span className="text-[12.5px] text-crm-subtle">{suffix}</span>}
        </span>
      </span>
      {delta && (
        <span className="mt-2.5 flex items-center gap-1.5 text-[12px] text-crm-subtle">
          {delta.pct === null ? (
            <span>Sem base no período anterior</span>
          ) : (
            <>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium tabular-nums',
                  delta.pct === 0
                    ? 'text-crm-muted'
                    : (delta.pct > 0) === (delta.goodWhenUp ?? true)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {delta.pct > 0 ? '↗' : delta.pct < 0 ? '↘' : '→'} {Math.abs(delta.pct).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
              </span>
              {delta.label}
            </>
          )}
        </span>
      )}
      {hint && (
        <span className="mt-3 flex items-center gap-2 text-[12px] text-crm-subtle">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT[tone])} />
          <span className="truncate">{hint}</span>
        </span>
      )}
      {progress !== undefined && (
        <span className="mt-4 block h-1 overflow-hidden rounded-full bg-crm-fg/[0.06]">
          <motion.span
            className={cn('block h-full rounded-full', TONE_DOT[tone === 'neutral' ? 'accent' : tone])}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
      )}
    </Comp>
  )
}

export function Panel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className={cn('flex flex-col rounded-xl border border-crm-border bg-crm-surface shadow-sm', className)}>
      {(title || actions) && (
        <header className="flex flex-col gap-3 border-b border-crm-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-crm-fg">{title}</h3>}
            {description && <p className="mt-0.5 text-[12.5px] text-crm-subtle">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('min-h-0 flex-1 p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

/** Abas/segmentos com destaque que desliza entre as opções. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  id,
  size = 'md',
  className,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (value: T) => void
  /** Identificador único na tela, para a animação não pular entre grupos. */
  id: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div role="tablist" className={cn('inline-flex items-center gap-0.5 rounded-lg border border-crm-border bg-crm-surface-2 p-0.5', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-md font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[12.5px]',
              selected ? 'text-crm-fg' : 'text-crm-subtle hover:text-crm-fg'
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${id}`}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-md border border-crm-border bg-crm-surface shadow-sm"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-crm-border bg-crm-surface-2 text-crm-subtle shadow-xs [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
      )}
      <p className="text-[14px] font-medium text-crm-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-crm-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Linhas de carregamento: ocupa o lugar da lista enquanto os dados chegam, para não parecer vazio. */
export function SkeletonRows({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-crm-border/70', className)} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <span className="crm-shimmer h-8 w-8 shrink-0 rounded-lg" />
          <span className="flex-1 space-y-1.5">
            <span className="crm-shimmer block h-3 w-2/5 rounded" />
            <span className="crm-shimmer block h-2.5 w-1/4 rounded" />
          </span>
          <span className="crm-shimmer h-5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  )
}

/** Cartão com brilho suave que acompanha o cursor. */
export function SpotlightCard({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`)
        event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`)
        props.onPointerMove?.(event)
      }}
      className={cn('crm-spotlight relative rounded-xl border border-crm-border bg-crm-surface shadow-sm', className)}
    >
      {children}
    </div>
  )
}
