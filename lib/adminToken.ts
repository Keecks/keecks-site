import crypto from 'crypto'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()
const ADMIN_APPROVE_SECRET = clean(process.env.ADMIN_APPROVE_SECRET)

// HMAC token tying an admin action to a specific booking id.
// Independent of date/time, so it stays valid after a reschedule.
export function signToken(bookingId: string | number): string {
  return crypto
    .createHmac('sha256', ADMIN_APPROVE_SECRET)
    .update(String(bookingId))
    .digest('hex')
}

export function verifyToken(bookingId: string | number, token: string): boolean {
  try {
    const expected = signToken(bookingId)
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
  } catch {
    return false
  }
}

// Base URL used to build admin action links in emails.
export function getBaseUrl(): string {
  return clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.keecks.ai'
}
