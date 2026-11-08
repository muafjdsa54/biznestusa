import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '@/lib/server-auth'
import {
  checkRateLimit,
  getClientIp,
  rateLimitExceededResponse,
  RATE_LIMITS,
} from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * SmartTalk chat — P1-7 (BIZNESTUSA-SECURITY-AUDIT-2026-11-08 §3.3/§5).
 *
 * AUTH: a valid Firebase ID token is REQUIRED before any OpenAI call
 * (`Authorization: Bearer <idToken>`, verified by lib/server-auth.ts
 * against Google's tokeninfo endpoint). No token => 401, no spend.
 * The route is dormant while AI_INTEGRATIONS_OPENAI_API_KEY is unset;
 * this gate is in place BEFORE any key is ever set, so the moment the
 * key goes live the route is already authenticated + rate-limited.
 * NOTE: no UI in the repo calls this route today (grep for
 * "api/smarttalk" finds no caller) — any future client MUST send the
 * Authorization header (e.g. `await auth.currentUser?.getIdToken()`),
 * or every call will 401.
 *
 * PROMPT INJECTION: user-supplied `system` role messages are stripped —
 * only the server's own SYSTEM_PROMPT below is ever sent to OpenAI.
 * Messages are also capped (last 30, 4000 chars each) so one request
 * cannot smuggle a huge context. max_tokens stays 500/response.
 *
 * RATE LIMIT: 20/hour per IP pre-auth (so unauthenticated floods never
 * reach token verification) + 20/hour per verified uid.
 */

const OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY
const OPENAI_BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || 'https://api.openai.com/v1'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are BizNest USA Assistant, a helpful AI assistant for BizNest USA - the premier American business directory, professional portfolio network, and job marketplace platform. 

Your responsibilities:
1. Help users list their business or create a professional profile on the platform
2. Answer questions about how the directory and search work across 39 states and Washington, D.C.
3. Provide information about local SEO benefits and hiring tools
4. Be friendly, professional, concise, and helpful

Key Information:
- BizNest USA is a business and professional directory covering 39 states and Washington, D.C.
- Businesses get published after payment verification and admin approval
- Listings include business info, phone, website, physical location, opening hours, and services
- Listing owners can request updates; edit access depends on the listing tier
- Standard listings are free with optional verification services

Be encouraging, responsive, and solve problems. If users have questions or need human assistance, offer to connect them via email at support@biznestusa.com.`

async function streamOpenAIResponse(
  messages: Message[],
  res: NextResponse
) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body from OpenAI')
    }

    // Send SSE stream headers
    const encoder = new TextEncoder()
    const textStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: {"done": true}\n\n'))
                  continue
                }

                try {
                  const json = JSON.parse(data)
                  const content = json.choices?.[0]?.delta?.content || ''
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    )
                  }
                } catch {}
              }
            }
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(textStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const encoder = new TextEncoder()

    return new Response(
      encoder.encode(
        `data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`
      ),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Per-IP rate limit FIRST: unauthenticated floods must not reach
    //    token verification (or OpenAI) at all.
    const ipLimit = checkRateLimit(
      `smarttalk:ip:${getClientIp(request)}`,
      RATE_LIMITS.chat
    )
    if (!ipLimit.allowed) {
      return rateLimitExceededResponse(ipLimit.resetAfterSeconds)
    }

    // 2. Auth gate: valid Firebase ID token required, before any
    //    OpenAI call. 401 (or 503 if the verifier is down) otherwise.
    const auth = await verifyUserToken(request)
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    // 3. Per-account rate limit: 20 chat requests / hour per uid.
    const userLimit = checkRateLimit(
      `smarttalk:uid:${auth.uid}`,
      RATE_LIMITS.chat
    )
    if (!userLimit.allowed) {
      return rateLimitExceededResponse(userLimit.resetAfterSeconds)
    }

    const { messages } = await request.json()

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }

    // 4. Strip user-supplied `system` messages: only the server's own
    //    SYSTEM_PROMPT may set the assistant's instructions. Also drop
    //    any non user/assistant roles and cap the history so a single
    //    request cannot smuggle a huge context.
    const MAX_MESSAGES = 30
    const MAX_CONTENT_CHARS = 4000
    const sanitized: Message[] = messages
      .filter(
        (m): m is Message =>
          !!m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string'
      )
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }))

    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: 'No valid user messages provided' },
        { status: 400 }
      )
    }

    return await streamOpenAIResponse(sanitized, NextResponse.json({}))
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
