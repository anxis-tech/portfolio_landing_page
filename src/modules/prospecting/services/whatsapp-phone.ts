import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js'

/**
 * Normalizes a raw phone number into an E.164 string (+<country><digits>)
 * Uses libphonenumber-js strictly.
 * Default country is BR if not specified.
 */
export function normalizeToE164(
  raw: string,
  defaultCountry: CountryCode = 'BR'
): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry)
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164')
    }
  } catch {
    return null
  }
  return null
}

/**
 * Verifies if a string is already in valid E.164 format.
 */
export function isValidE164(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  if (!/^\+[1-9][0-9]{7,14}$/.test(phone)) return false
  try {
    const parsed = parsePhoneNumberFromString(phone)
    return Boolean(parsed && parsed.isValid())
  } catch {
    return false
  }
}

/**
 * Converts an E.164 string into Meta API recipient format (dígitos sem o +).
 */
export function toMetaRecipient(e164: string): string {
  if (!e164) return ''
  return e164.replace(/^\+/, '')
}

/**
 * Formats an E.164 phone number for display in the UI (National format if BR, International otherwise).
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return ''
  try {
    const parsed = parsePhoneNumberFromString(phone)
    if (parsed) {
      if (parsed.country === 'BR') {
        return parsed.formatNational()
      }
      return parsed.formatInternational()
    }
  } catch {
    // fallback
  }
  return phone
}

