import assert from 'node:assert/strict'
import { test } from 'node:test'
import rulesData from '../scoring/default-rules.json'
import { calculateScore } from '../scoring/engine.ts'
import type { Rule, ScoringInput } from '../scoring/types.ts'
import { detectLeadOpportunity } from './lead-opportunity.service.ts'

const rules = rulesData as Rule[]
const input: ScoringInput = {
  business: { name: 'Empresa', phone: '+5585991234567' },
  digital: {},
  segment: { priority: 5, highTicket: true, booking: true, clientArea: true },
  aiThreshold: 85,
  campaignId: 'campaign',
}

test('existing opportunity categories survive the removal of numeric qualification', () => {
  for (const websiteKind of ['none', 'social_only', 'messaging_only', 'link_aggregator', 'website'] as const) {
    for (const closed of [false, true]) {
      const sample = { ...input, business: { ...input.business, closed }, digital: { websiteKind } }
      assert.equal(detectLeadOpportunity(sample, rules), calculateScore(sample, rules).opportunityType)
    }
  }
})

test('campaign overrides and absent rules retain existing opportunity semantics', () => {
  const sample = { ...input, digital: { websiteKind: 'none' as const } }
  const overrides = rules.map(rule => ({ ...rule, campaign_id: 'campaign', enabled: false }))
  assert.equal(detectLeadOpportunity(sample, [...rules, ...overrides]), null)
  assert.equal(detectLeadOpportunity(sample, []), null)
})
