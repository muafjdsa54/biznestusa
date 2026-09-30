import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-static'
export const revalidate = 86400

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'ads.txt')
  let content = '# BizNest USA Authorized Digital Sellers (ads.txt)\ngoogle.com, pub-3836871693569517, DIRECT, f08c47fec0942fa0\n'

  try {
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8')
    }
  } catch (_) {}

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
