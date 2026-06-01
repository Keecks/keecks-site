import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return new NextResponse('Missing code', { status: 400 })
  }

  const client = getOAuthClient()
  const { tokens } = await client.getToken(code)

  // Show the refresh token — copy it into .env.local as GOOGLE_REFRESH_TOKEN
  return new NextResponse(`
    <html><body style="font-family:monospace;background:#111;color:#e7e7e7;padding:40px;">
      <h2 style="color:#ff7005">✓ Autorizzazione completata</h2>
      <p>Copia questo refresh token nel file <strong>.env.local</strong> come <strong>GOOGLE_REFRESH_TOKEN</strong>:</p>
      <p style="background:#222;padding:16px;border-radius:8px;word-break:break-all;color:#4ade80">
        ${tokens.refresh_token ?? 'Nessun refresh token — riprova con prompt:consent'}
      </p>
      <p style="color:rgba(231,231,231,0.5);font-size:13px">Puoi chiudere questa pagina dopo aver copiato il token.</p>
    </body></html>
  `, { headers: { 'Content-Type': 'text/html' } })
}
