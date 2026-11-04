import { z } from 'zod'
import { apiJSON, requireKey } from './http.ts'
import type { Business, DigitalPresence } from '../types/index.ts'
import { classifyHostname, isShortener } from './website-classification.service.ts'
export const searchPlaceItemSchema = z
  .object({
    id: z.string().optional().nullable(),
    google_place_id: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    displayName: z
      .object({
        text: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
  })
  .transform((raw, ctx) => {
    const googlePlaceId = (raw.google_place_id ?? raw.id ?? '').trim()
    const name = (raw.displayName?.text ?? raw.name ?? '').trim()
    if (!googlePlaceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google_place_id deve ser uma string não vazia',
      })
      return z.NEVER
    }
    if (!name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'name deve ser uma string não vazia após trim',
      })
      return z.NEVER
    }
    return {
      google_place_id: googlePlaceId,
      name,
      id: googlePlaceId,
      displayName: { text: name },
    }
  })

export const searchSchema = z.object({
  places: z
    .array(z.unknown())
    .transform((items) => {
      const valid: z.infer<typeof searchPlaceItemSchema>[] = []
      let ignoredCount = 0
      for (const item of items) {
        const parsed = searchPlaceItemSchema.safeParse(item)
        if (parsed.success) {
          valid.push(parsed.data)
        } else {
          ignoredCount++
        }
      }
      if (ignoredCount > 0) {
        console.warn(`[GooglePlaces] ${ignoredCount} resultado(s) malformado(s) ignorado(s) no discover_places.`)
      }
      return valid
    })
    .default([]),
  nextPageToken: z.string().optional(),
})
const placeSchema = z.object({
  id: z.string().min(1),
  displayName: z
    .object({
      text: z.string().optional().default(''),
    })
    .optional()
    .default({ text: '' }),
  businessStatus: z.string().optional().nullable(),
  primaryType: z.string().optional().nullable(),
  websiteUri: z.string().optional().nullable(),
  internationalPhoneNumber: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  userRatingCount: z.number().int().optional().nullable(),
  location: z.object({ latitude: z.number(), longitude: z.number() }).optional().nullable(),
  addressComponents: z
    .array(
      z.object({
        longText: z.string().optional().nullable(),
        shortText: z.string().optional().nullable(),
        types: z.array(z.string()).optional().default([]),
      })
    )
    .default([]),
  attributions: z
    .array(z.object({ provider: z.string(), providerUri: z.string().optional().nullable() }))
    .optional()
    .nullable(),
})
export function websiteKind(website?: string | null): NonNullable<DigitalPresence['websiteKind']> {
  if (!website) return 'none'
  try {
    const host = new URL(website).hostname.toLowerCase()
    if (isShortener(host)) return 'website'
    return classifyHostname(host)
  } catch {
    return 'website'
  }
}
export async function searchPlaces(key: string | undefined, textQuery: string, pageToken?: string) {
  return searchSchema.parse(
    await apiJSON(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': requireKey(key, 'GOOGLE_PLACES_API_KEY'),
          'X-Goog-FieldMask': 'places.id,places.displayName,nextPageToken',
        },
        body: JSON.stringify({
          textQuery,
          pageSize: 20,
          languageCode: 'pt-BR',
          regionCode: 'BR',
          ...(pageToken ? { pageToken } : {}),
        }),
      },
      'Google Places'
    )
  )
}
export async function enrichPlace(key: string | undefined, id: string): Promise<Business> {
  const p = placeSchema.parse(
    await apiJSON(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=pt-BR`,
      {
        headers: {
          'X-Goog-Api-Key': requireKey(key, 'GOOGLE_PLACES_API_KEY'),
          'X-Goog-FieldMask':
            'id,displayName,businessStatus,primaryType,websiteUri,internationalPhoneNumber,rating,userRatingCount,addressComponents,location,attributions',
        },
      },
      'Google Places'
    )
  )
  const component = (type: string, short = false) => {
    const c = p.addressComponents.find((c) => c.types?.includes(type))
    return (short ? c?.shortText : c?.longText) ?? null
  }
  return {
    name: p.displayName?.text || 'Sem nome informado',
    category: p.primaryType ?? undefined,
    website: p.websiteUri ?? null,
    phone: p.internationalPhoneNumber ?? null,
    rating: p.rating ?? null,
    reviews: p.userRatingCount ?? null,
    city: component('administrative_area_level_2') ?? component('locality'),
    state: component('administrative_area_level_1', true),
    country: component('country', true),
    ...(p.location ? { latitude: p.location.latitude, longitude: p.location.longitude } : {}),
    closed: p.businessStatus === 'CLOSED_PERMANENTLY' || p.businessStatus === 'CLOSED_TEMPORARILY',
    attributions: p.attributions
      ? p.attributions.map((a) => ({
          provider: a.provider,
          providerUri: a.providerUri ?? undefined,
        }))
      : undefined,
  }
}
