// Client-side helper: attach the signed-in user's Firebase ID token to
// API calls. The routes gated by lib/server-auth.ts (send-business-email,
// payments/list, admin/payment-actions, professionals/update,
// payments/submit-proof, business/post-submit, jobs/apply, smarttalk/chat)
// return 401 without it — a missing token must never be silently sent as
// an anonymous call, so callers spread these headers into fetch().
// Returns {} when nobody is signed in (the route then 401s honestly).
import { auth } from './firebase'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const token = await auth.currentUser?.getIdToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
