import { evaluate, factsFor, resolveRules } from '../scoring/evaluator.ts'
import type { Rule, ScoringInput } from '../scoring/types.ts'
import type { OpportunityType } from '../types/index.ts'

/** Preserve opportunity categories independently of lead qualification and numeric scores. */
export function detectLeadOpportunity(
  input: Pick<ScoringInput, 'business' | 'digital' | 'segment' | 'campaignId'>,
  rules: readonly Rule[]
): OpportunityType | null {
  const facts = factsFor(input)
  const applicable = resolveRules(rules, input.campaignId).filter(
    rule => rule.enabled && Number.isFinite(rule.points) && rule.points > 0 && evaluate(rule, facts)
  )
  const site = applicable.some(rule => rule.score_group === 'site')
  const system = applicable.some(rule => rule.score_group === 'system')
  if (site && system) return 'website_and_software'
  if (system) return 'software'
  if (site) return input.digital.websiteKind === 'website' ? 'redesign' : 'website'
  return null
}
