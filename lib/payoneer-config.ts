/**
 * Payoneer Payment Link Configuration
 *
 * URLs are retrieved dynamically from environment variables:
 * - PAYONEER_BASIC_PAYMENT_URL (for $1 review_1 plan)
 * - PAYONEER_STANDARD_PAYMENT_URL (for $5 priority_5 plan)
 * - PAYONEER_AUTHORITATIVE_PAYMENT_URL (for $10 authoritative_10 plan)
 *
 * DO NOT hardcode private credentials.
 */

import { BusinessPlan } from './data'

export function getPayoneerPaymentUrl(plan: BusinessPlan): string {
  let url = ''

  switch (plan) {
    case 'authoritative_10':
      url = process.env.PAYONEER_AUTHORITATIVE_PAYMENT_URL ||
            process.env.NEXT_PUBLIC_PAYONEER_AUTHORITATIVE_PAYMENT_URL ||
            ''
      break
    case 'priority_5':
      url = process.env.PAYONEER_STANDARD_PAYMENT_URL ||
            process.env.NEXT_PUBLIC_PAYONEER_STANDARD_PAYMENT_URL ||
            ''
      break
    case 'review_1':
    default:
      url = process.env.PAYONEER_BASIC_PAYMENT_URL ||
            process.env.NEXT_PUBLIC_PAYONEER_BASIC_PAYMENT_URL ||
            ''
      break
  }

  return url.trim()
}
