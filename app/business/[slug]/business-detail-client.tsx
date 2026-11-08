'use client'

// NOTE: this file used to hold a second, client-rendered copy of the business
// detail page (BusinessDetailClient). That copy was dead code — zero
// importers — and its review handler only wrote to React state, so it was
// deleted 2026-11-08. The file now holds only the shared time-aware
// OpenNowBadge used by app/business/[slug]/page.tsx. Real review submission
// lives in lib/review-service.ts (submitBusinessReview).

import { useEffect, useState } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Time-aware "Open Now" status (UX audit #5).
// Hours are stored as Record<day, "09:00 AM - 06:00 PM" | "Closed" |
// "Open 24 Hours">. Keys may be single days ("Monday"), ranges
// ("Monday - Saturday") or "General Hours". No timezone is stored with the
// hours, so the status is computed in the business's state primary US
// timezone (the visitor's local time when the state is unknown or unmapped).
// Multi-zone states use their majority zone.
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const STATE_TIMEZONES: Array<[string, string[]]> = [
  ['America/New_York', ['CT', 'Connecticut', 'DE', 'Delaware', 'FL', 'Florida', 'GA', 'Georgia', 'MA', 'Massachusetts', 'MD', 'Maryland', 'ME', 'Maine', 'NC', 'North Carolina', 'NH', 'New Hampshire', 'NJ', 'New Jersey', 'NY', 'New York', 'OH', 'Ohio', 'PA', 'Pennsylvania', 'RI', 'Rhode Island', 'SC', 'South Carolina', 'VA', 'Virginia', 'VT', 'Vermont', 'WV', 'West Virginia', 'MI', 'Michigan', 'IN', 'Indiana', 'KY', 'Kentucky', 'DC', 'District of Columbia']],
  ['America/Chicago', ['AL', 'Alabama', 'AR', 'Arkansas', 'IA', 'Iowa', 'IL', 'Illinois', 'KS', 'Kansas', 'LA', 'Louisiana', 'MN', 'Minnesota', 'MO', 'Missouri', 'MS', 'Mississippi', 'NE', 'Nebraska', 'ND', 'North Dakota', 'OK', 'Oklahoma', 'SD', 'South Dakota', 'TN', 'Tennessee', 'TX', 'Texas', 'WI', 'Wisconsin']],
  ['America/Denver', ['CO', 'Colorado', 'MT', 'Montana', 'NM', 'New Mexico', 'UT', 'Utah', 'WY', 'Wyoming']],
  ['America/Los_Angeles', ['CA', 'California', 'NV', 'Nevada', 'OR', 'Oregon', 'WA', 'Washington']],
  ['America/Phoenix', ['AZ', 'Arizona']],
  ['America/Anchorage', ['AK', 'Alaska']],
  ['Pacific/Honolulu', ['HI', 'Hawaii']],
]

export function getBusinessTimezone(state?: string | null, stateCode?: string | null): string | undefined {
  const key = (stateCode || state || '').trim().toLowerCase()
  if (!key) return undefined
  for (const [tz, names] of STATE_TIMEZONES) {
    if (names.some((n) => n.toLowerCase() === key)) return tz
  }
  return undefined
}

export type OpenStatus =
  | { state: 'open'; label: string; detail: string }
  | { state: 'closed'; label: string; detail: string }
  | { state: 'unknown' }

function parseTimeToMinutes(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?$/)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2] || '0', 10)
  const ap = (m[3] || '').toUpperCase()
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function formatMinutes(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const ap = h24 >= 12 ? 'PM' : 'AM'
  const h = h24 % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

function dayIndexOf(token: string): number {
  const t = token.trim().toLowerCase()
  if (!t) return -1
  return WEEKDAYS.findIndex((d) => d.toLowerCase() === t || d.toLowerCase().startsWith(t))
}

function expandDayKey(key: string): number[] {
  const k = key.trim().toLowerCase()
  if (k === 'general hours' || k === 'hours' || k === 'everyday' || k === 'daily') return [0, 1, 2, 3, 4, 5, 6]
  const single = dayIndexOf(k)
  if (single >= 0) return [single]
  const range = k.split('-').map((s) => s.trim())
  if (range.length === 2) {
    const start = dayIndexOf(range[0])
    const end = dayIndexOf(range[1])
    if (start >= 0 && end >= 0) {
      const days: number[] = []
      let d = start
      for (let i = 0; i < 7; i++) {
        days.push(d)
        if (d === end) break
        d = (d + 1) % 7
      }
      return days
    }
  }
  return []
}

interface DayHours { open: number; close: number; is24: boolean }

function parseDayHours(value: string): DayHours | 'closed' | null {
  const v = value.trim()
  if (/closed/i.test(v)) return 'closed'
  if (/24\s*hour/i.test(v) || /^24\/7$/i.test(v)) return { open: 0, close: 24 * 60, is24: true }
  const parts = v.split(/\s*-\s*/)
  if (parts.length !== 2) return null
  const open = parseTimeToMinutes(parts[0])
  const close = parseTimeToMinutes(parts[1])
  if (open === null || close === null) return null
  return { open, close, is24: false }
}

function buildSchedule(hours: Record<string, string>): Map<number, DayHours | 'closed'> {
  const sched = new Map<number, DayHours | 'closed'>()
  for (const [key, value] of Object.entries(hours || {})) {
    const parsed = parseDayHours(String(value))
    if (parsed === null) continue
    for (const d of expandDayKey(key)) sched.set(d, parsed)
  }
  return sched
}

function nowInTimezone(timeZone?: string): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(new Date())
    const get = (t: string) => parts.find((p) => p.type === t)?.value
    const day = WEEKDAYS.indexOf(get('weekday') || '')
    const hour = parseInt(get('hour') || '0', 10) % 24
    const minutes = hour * 60 + parseInt(get('minute') || '0', 10)
    return { day: day < 0 ? new Date().getDay() : day, minutes }
  } catch {
    const now = new Date()
    return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() }
  }
}

export function getOpenStatus(
  operatingHours: Record<string, string> | undefined | null,
  state?: string | null,
  stateCode?: string | null,
): OpenStatus {
  if (!operatingHours || Object.keys(operatingHours).length === 0) return { state: 'unknown' }
  const sched = buildSchedule(operatingHours)
  if (sched.size === 0) return { state: 'unknown' }
  const tz = getBusinessTimezone(state, stateCode)
  const { day: today, minutes: now } = nowInTimezone(tz)

  const isOpenAt = (dayIdx: number, mins: number): DayHours | null => {
    const h = sched.get(dayIdx)
    if (!h || h === 'closed') return null
    if (h.is24) return h
    if (h.close > h.open) return mins >= h.open && mins < h.close ? h : null
    // Overnight range (e.g. 9:00 PM - 2:00 AM): open late evening or after midnight.
    return mins >= h.open || mins < h.close ? h : null
  }

  const todayHours = sched.get(today)
  // An overnight range from yesterday is still open after midnight.
  const yesterday = (today + 6) % 7
  const yHours = sched.get(yesterday)
  const overnightOpen =
    yHours && yHours !== 'closed' && !yHours.is24 && yHours.close <= yHours.open && now < yHours.close
      ? yHours
      : null
  const current = isOpenAt(today, now) || overnightOpen
  if (current) {
    if (current.is24) return { state: 'open', label: 'Open Now', detail: 'Open 24 hours' }
    const closeMins = overnightOpen ? overnightOpen.close : current.close
    return { state: 'open', label: 'Open Now', detail: `Closes ${formatMinutes(closeMins)}` }
  }

  // Closed: if it opens later today, say so; otherwise find the next open day.
  if (todayHours && todayHours !== 'closed' && !todayHours.is24 && now < todayHours.open) {
    return { state: 'closed', label: 'Closed', detail: `Opens at ${formatMinutes(todayHours.open)}` }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (today + i) % 7
    const h = sched.get(d)
    if (h && h !== 'closed') {
      const when = i === 1 ? 'tomorrow' : WEEKDAYS[d]
      const at = h.is24 ? '· Open 24 hours' : `at ${formatMinutes(h.open)}`
      return { state: 'closed', label: 'Closed', detail: `Opens ${when} ${at}` }
    }
  }
  return { state: 'closed', label: 'Closed', detail: 'No opening hours listed' }
}

/** Live open/closed badge. Renders after mount so server and client clocks
 *  can never disagree during hydration; refreshes every minute. */
export function OpenNowBadge({
  operatingHours,
  state,
  stateCode,
}: {
  operatingHours?: Record<string, string> | null
  state?: string | null
  stateCode?: string | null
}) {
  const [status, setStatus] = useState<OpenStatus>({ state: 'unknown' })
  useEffect(() => {
    const update = () => setStatus(getOpenStatus(operatingHours, state, stateCode))
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatingHours, state, stateCode])

  if (status.state === 'unknown') return null
  if (status.state === 'open') {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{status.label} · {status.detail}</span>
      </span>
    )
  }
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700/80 text-slate-200 border border-slate-600 flex items-center gap-1">
      <Clock className="w-3.5 h-3.5 text-amber-400" />
      <span>{status.label} · {status.detail}</span>
    </span>
  )
}

