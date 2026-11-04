'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WhatsAppSummaryDTO } from '../types/whatsapp'
import { loadWhatsAppSummariesAction } from '../actions/whatsapp.actions'

export function useWhatsAppSummaries(campaignLeadIds: string[], leadListRevision = 0) {
  const [summaries, setSummaries] = useState<Record<string, WhatsAppSummaryDTO>>({})
  const [isLoading, setIsLoading] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const idsKey = campaignLeadIds.slice(0, 25).sort().join(',')

  const fetchSummaries = useCallback(async (ids: string[]) => {
    if (!ids || ids.length === 0) {
      setSummaries({})
      return
    }

    setIsLoading(true)
    const clamped = ids.slice(0, 25)
    const res = await loadWhatsAppSummariesAction(clamped)
    if (res.ok) {
      setSummaries(res.data)
    }
    setIsLoading(false)
  }, [])

  const debouncedRefresh = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      const ids = idsKey.split(',').filter(Boolean)
      fetchSummaries(ids)
    }, 300)
  }, [idsKey, fetchSummaries])

  useEffect(() => {
    const ids = idsKey.split(',').filter(Boolean)
    if (ids.length === 0) {
      return
    }

    let cancelled = false
    void (async () => {
      const clamped = ids.slice(0, 25)
      const res = await loadWhatsAppSummariesAction(clamped)
      if (cancelled) return
      if (res.ok) {
        setSummaries(res.data)
      }
      setIsLoading(false)
    })()

    const supabase = createClient()
    const channel = supabase.channel(`whatsapp-summaries-${idsKey.slice(0, 32)}`)

    // Up to 25 scoped bindings on whatsapp_conversations (§12)
    for (const leadId of ids) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_conversations',
          filter: `campaign_lead_id=eq.${leadId}`,
        },
        () => {
          debouncedRefresh()
        }
      )
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_conversations',
          filter: `campaign_lead_id=eq.${leadId}`,
        },
        () => {
          debouncedRefresh()
        }
      )
    }

    channel.subscribe()

    return () => {
      cancelled = true
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [idsKey, leadListRevision, fetchSummaries, debouncedRefresh])

  return {
    summaries,
    isLoading,
    refresh: debouncedRefresh,
  }
}
