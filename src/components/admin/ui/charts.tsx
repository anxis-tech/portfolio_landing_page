'use client'

// Gráficos do CRM em SVG, sem biblioteca: área suave, barras agrupadas, rosca e sparkline.
// Monocromáticos por padrão (tons do texto do tema), com tooltip ao passar o mouse.

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface Series {
  key: string
  label: string
  values: number[]
}

/** Tons da série i: do texto pleno até 22%, para ler bem nos dois temas. */
const SERIES_ALPHA = [1, 0.5, 0.24, 0.12]
const seriesColor = (i: number) => `color-mix(in oklab, var(--crm-fg) ${SERIES_ALPHA[i % SERIES_ALPHA.length] * 100}%, transparent)`

// Curva monotônica (Fritsch–Carlson): suave sem passar do valor real entre pontos.
function smoothPath(points: [number, number][]) {
  if (points.length < 2) return points.length ? `M${points[0][0]},${points[0][1]}` : ''
  const n = points.length
  const dx: number[] = [],
    dy: number[] = [],
    m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0])
    dy.push(points[i + 1][1] - points[i][1])
    m.push(dy[i] / dx[i])
  }
  const t: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2)
  t.push(m[n - 2])
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3
    d += ` C${points[i][0] + c},${points[i][1] + t[i] * c} ${points[i + 1][0] - c},${points[i + 1][1] - t[i + 1] * c} ${points[i + 1][0]},${points[i + 1][1]}`
  }
  return d
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / p
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-crm-muted">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[3px]" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function Tooltip({ title, rows, format }: { title: string; rows: { label: string; value: number; color: string }[]; format: (n: number) => string }) {
  return (
    <div className="pointer-events-none min-w-[150px] rounded-lg border border-crm-border bg-crm-surface/95 px-3 py-2 text-[12px] shadow-lg backdrop-blur">
      <div className="mb-1 font-medium text-crm-fg">{title}</div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 text-crm-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[3px]" style={{ background: row.color }} />
            {row.label}
          </span>
          <span className="font-medium tabular-nums text-crm-fg">{format(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

const PAD = { top: 12, right: 8, bottom: 26, left: 60 }

/** Mede a largura real do gráfico, para desenhar em pixels (texto dos eixos sem distorção). */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(200, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function AreaChart({
  labels,
  series,
  format,
  axisFormat = format,
  height = 240,
}: {
  labels: string[]
  series: Series[]
  format: (n: number) => string
  axisFormat?: (n: number) => string
  height?: number
}) {
  const id = useId().replace(/:/g, '')
  const [ref, W] = useWidth()
  const H = height
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)))
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f)
  const labelStep = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(innerW / 70))))

  const paths = useMemo(
    () =>
      series.map((s) => {
        const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number])
        const line = smoothPath(pts)
        const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${PAD.top + innerH} L${pts[0][0]},${PAD.top + innerH} Z` : ''
        return { line, area }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, max, labels.length, W, H],
  )

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={W} height={H} className="overflow-visible" role="img" aria-label="Gráfico de área">
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`${id}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesColor(i)} stopOpacity={i === 0 ? 0.16 : 0.08} />
              <stop offset="100%" stopColor={seriesColor(i)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--crm-border)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-crm-subtle text-[10.5px]">
              {axisFormat(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) =>
          i % labelStep === 0 || i === labels.length - 1 ? (
            <text key={label + i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-crm-subtle text-[10.5px]">
              {label}
            </text>
          ) : null,
        )}
        {[...series]
          .map((s, i) => ({ s, i }))
          .reverse()
          .map(({ s, i }) => (
            <g key={s.key}>
              <motion.path
                d={paths[i].area}
                fill={`url(#${id}-g${i})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <motion.path
                d={paths[i].line}
                fill="none"
                stroke={seriesColor(i)}
                strokeWidth={i === 0 ? 2 : 1.6}

                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--crm-border-strong)" strokeDasharray="3 3" />
            {series.map((s, i) => (
              <circle key={s.key} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={3.5} fill="var(--crm-surface)" stroke={seriesColor(i)} strokeWidth={2} />
            ))}
          </g>
        )}
        {/* Faixas invisíveis que capturam o mouse por ponto. */}
        {labels.map((label, i) => {
          const half = labels.length <= 1 ? innerW / 2 : innerW / (labels.length - 1) / 2
          return (
            <rect
              key={`hit-${label}-${i}`}
              x={x(i) - half}
              y={PAD.top}
              width={half * 2}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="absolute top-2 z-10"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${x(hover) / W > 0.6 ? 'calc(-100% - 12px)' : '12px'})` }}
        >
          <Tooltip
            title={labels[hover]}
            rows={series.map((s, i) => ({ label: s.label, value: s.values[hover] ?? 0, color: seriesColor(i) }))}
            format={format}
          />
        </div>
      )}
    </div>
  )
}

export function GroupedBars({
  labels,
  series,
  format,
  axisFormat = format,
  height = 240,
}: {
  labels: string[]
  series: Series[]
  format: (n: number) => string
  axisFormat?: (n: number) => string
  height?: number
}) {
  const [ref, W] = useWidth()
  const H = height
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)))
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const band = innerW / Math.max(1, labels.length)
  const barW = Math.min(18, (band * 0.5) / Math.max(1, series.length))
  const gap = 4
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f)

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={W} height={H} className="overflow-visible" role="img" aria-label="Gráfico de barras">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--crm-border)" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-crm-subtle text-[10.5px]">
              {axisFormat(t)}
            </text>
          </g>
        ))}
        {labels.map((label, li) => {
          const cx = PAD.left + band * li + band / 2
          const groupW = series.length * barW + (series.length - 1) * gap
          return (
            <g key={label + li} onMouseEnter={() => setHover(li)} onMouseLeave={() => setHover(null)}>
              <rect
                x={PAD.left + band * li}
                y={PAD.top}
                width={band}
                height={innerH}
                fill={hover === li ? 'color-mix(in oklab, var(--crm-fg) 4%, transparent)' : 'transparent'}
                rx={6}
              />
              {series.map((s, si) => {
                const v = s.values[li] ?? 0
                const h = Math.max(v > 0 ? 2 : 0, (v / max) * innerH)
                return (
                  <motion.rect
                    key={s.key}
                    x={cx - groupW / 2 + si * (barW + gap)}
                    width={barW}
                    rx={Math.min(4, barW / 2)}
                    fill={seriesColor(si)}
                    initial={{ height: 0, y: PAD.top + innerH }}
                    animate={{ height: h, y: PAD.top + innerH - h }}
                    transition={{ duration: 0.7, delay: li * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  />
                )
              })}
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-crm-subtle text-[10.5px]">
                {label.length > 14 ? label.slice(0, 13) + '…' : label}
              </text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="absolute top-2 z-10"
          style={{
            left: `${((PAD.left + band * hover + band / 2) / W) * 100}%`,
            transform: `translateX(${(PAD.left + band * hover) / W > 0.6 ? 'calc(-100% - 12px)' : '12px'})`,
          }}
        >
          <Tooltip
            title={labels[hover]}
            rows={series.map((s, i) => ({ label: s.label, value: s.values[hover] ?? 0, color: seriesColor(i) }))}
            format={format}
          />
        </div>
      )}
    </div>
  )
}

export function Donut({
  items,
  format,
  centerLabel,
  size = 168,
}: {
  items: { label: string; value: number; hint?: ReactNode }[]
  format: (n: number) => string
  centerLabel: string
  size?: number
}) {
  const [hover, setHover] = useState<number | null>(null)
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0
  const shown = hover !== null ? items[hover] : null

  return (
    // A legenda vai para baixo quando o painel é estreito (consulta de contêiner, não da tela).
    <div className="@container w-full">
      <div className="flex flex-col items-center gap-6 @[460px]:flex-row">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--crm-border)" strokeWidth={12} />
            {total > 0 &&
              items.map((item, i) => {
                const len = (item.value / total) * c
                const seg = (
                  <motion.circle
                    key={item.label}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke={`color-mix(in oklab, var(--crm-fg) ${Math.max(14, 100 - i * 26)}%, transparent)`}
                    strokeWidth={hover === i ? 14 : 12}
                    strokeDasharray={`${Math.max(0, len - 1.2)} ${c}`}
                    initial={{ strokeDashoffset: -offset + len }}
                    animate={{ strokeDashoffset: -offset }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer transition-[stroke-width] duration-200"
                  />
                )
                offset += len
                return seg
              })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11.5px] text-crm-subtle">{shown ? shown.label : centerLabel}</span>
            <span className="mt-0.5 text-[17px] font-semibold tracking-[-0.02em] tabular-nums text-crm-fg">{format(shown ? shown.value : total)}</span>
          </div>
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-1">
          {items.map((item, i) => (
            <li
              key={item.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn('flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors', hover === i && 'bg-crm-fg/[0.04]')}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: `color-mix(in oklab, var(--crm-fg) ${Math.max(14, 100 - i * 26)}%, transparent)` }}
              />
              <span className="min-w-0 flex-1 truncate text-crm-fg">
                {item.label}
                {item.hint && <span className="ml-2 text-[11.5px] text-crm-subtle">{item.hint}</span>}
              </span>
              <span className="font-medium tabular-nums text-crm-fg">{format(item.value)}</span>
              <span className="w-10 text-right text-[12px] tabular-nums text-crm-subtle">{total ? Math.round((item.value / total) * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const pts = values.length > 1 ? values : [0, ...values, 0].slice(0, 2)
  const max = Math.max(1, ...pts)
  const min = Math.min(0, ...pts)
  const path = smoothPath(pts.map((v, i) => [(i / (pts.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 24] as [number, number]))
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn('h-8 w-24', className)} aria-hidden="true">
      <motion.path
        d={path}
        fill="none"
        stroke="var(--crm-fg)"
        strokeWidth={1.6}

        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export const chartColor = seriesColor
