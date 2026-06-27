import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ ok: false, status: 0 })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Scholee/1.0)' },
    })
    clearTimeout(timeout)

    // Some servers reject HEAD — retry with GET if we get 405
    if (res.status === 405) {
      const controller2 = new AbortController()
      const timeout2 = setTimeout(() => controller2.abort(), 8000)
      res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller2.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Scholee/1.0)' },
      })
      clearTimeout(timeout2)
    }

    // Treat anything below 500 as reachable (200-399 ok, 401/403/404 = site alive)
    return NextResponse.json({ ok: res.status < 500, status: res.status })
  } catch {
    return NextResponse.json({ ok: false, status: 0 })
  }
}
