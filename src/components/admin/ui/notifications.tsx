'use client'

import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, CancelCircleIcon, CheckmarkCircle01Icon, Shield01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

type NotificationKind = 'success' | 'error' | 'info'
interface Notification {
  id: number
  kind: NotificationKind
  message: string
}

const notificationEvent = 'anxis:notification'
const maxNotifications = 4
let sequence = 0
let notifications: Notification[] = []

function publish() {
  window.dispatchEvent(new Event(notificationEvent))
}

function show(kind: NotificationKind, message: string) {
  if (typeof window === 'undefined' || !message.trim()) return
  const entry = { id: ++sequence, kind, message }
  // Repeated connection failures should update one card rather than fill the screen.
  notifications = [...notifications.filter((item) => item.message !== message || item.kind !== kind), entry].slice(-maxNotifications)
  publish()
}

function dismiss(id: number) {
  notifications = notifications.filter((item) => item.id !== id)
  publish()
}

export const notify = {
  success: (message: string) => show('success', message),
  error: (message: string) => show('error', message),
  info: (message: string) => show('info', message),
}

function NotificationCard({ notification, isDarkMode }: { notification: Notification; isDarkMode: boolean }) {
  const { id, kind, message } = notification
  useEffect(() => {
    if (kind === 'error') return
    const timer = window.setTimeout(() => dismiss(id), 6000)
    return () => window.clearTimeout(timer)
  }, [id, kind])

  const icon = kind === 'success' ? CheckmarkCircle01Icon : kind === 'error' ? CancelCircleIcon : Shield01Icon
  const heading = kind === 'success' ? 'Concluído' : kind === 'error' ? 'Não foi possível concluir' : 'Aviso'

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg',
        isDarkMode ? 'bg-[#1A1E26] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      )}
    >
      <HugeiconsIcon
        icon={icon}
        className={cn('h-5 w-5 shrink-0 mt-0.5', kind === 'success' ? 'text-emerald-500' : kind === 'error' ? 'text-rose-500' : 'text-sky-500')}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold">{heading}</p>
        <p className={cn('text-xs leading-relaxed whitespace-pre-line break-words', isDarkMode ? 'text-slate-300' : 'text-slate-600')}>{message}</p>
      </div>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={() => dismiss(id)}
        className={cn('shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400', isDarkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900')}
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  )
}

/** Mount once in the CRM shell. Text-only cards never render arbitrary HTML. */
export function NotificationViewport({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>(() => [...notifications])

  useEffect(() => {
    const update = () => setVisibleNotifications([...notifications])
    window.addEventListener(notificationEvent, update)
    // Catch notifications emitted between rendering and subscribing to the event.
    update()
    return () => window.removeEventListener(notificationEvent, update)
  }, [])

  return (
    <aside
      aria-label="Notificações do sistema"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 font-sans"
    >
      {visibleNotifications.map((notification) => <NotificationCard key={notification.id} notification={notification} isDarkMode={isDarkMode} />)}
    </aside>
  )
}
