import { z } from 'zod'
import { pipelineStages } from '../types/index.ts'
export const filterSchema = z.object({
  campaignId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  classification: z
    .enum(['hot', 'cold'])
    .optional(),
  opportunity: z
    .enum(['website', 'redesign', 'software', 'automation', 'website_and_software'])
    .optional(),
  opportunityType: z
    .enum(['website', 'redesign', 'software', 'automation', 'website_and_software'])
    .optional(),
  segment: z.string().max(80).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  website: z.enum(['yes', 'none', 'social']).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minReviews: z.coerce.number().int().min(0).optional(),
  pipeline: z.enum(pipelineStages).optional(),
  since: z.iso.date().optional(),
  quick: z.enum(['hot', 'cold', 'none']).optional(),
  sort: z.enum(['classification', 'reviews', 'rating', 'performance', 'recent']).default('classification'),
})
export type LeadFilters = z.infer<typeof filterSchema>
export const stageSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(100),
  stage: z.enum(pipelineStages),
})
export const leadControlSchema = z.object({
  id: z.uuid(),
  action: z.enum(['retry', 'recalculate', 'refresh', 'discard', 'restore']),
})
