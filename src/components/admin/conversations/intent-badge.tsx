import { Badge, type Tone } from '@/components/admin/ui/kit'
import { INTENT_LABELS, type ConversationIntent } from '@/modules/prospecting/intent/classify'

const INTENT_TONES: Record<ConversationIntent, Tone> = {
  qualified: 'success',
  auto_reply: 'neutral',
  not_interested: 'danger',
  unclear: 'warning',
}

/** AI classification of the contact's replies; the reason shows on hover. */
export function IntentBadge({ intent, reason, className }: { intent: ConversationIntent; reason?: string | null; className?: string }) {
  return (
    <span title={reason ?? undefined} className="inline-flex shrink-0">
      <Badge tone={INTENT_TONES[intent]} dot className={className}>
        {INTENT_LABELS[intent]}
      </Badge>
    </span>
  )
}
