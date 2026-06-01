import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL        = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const ADMIN_PASSWORD      = process.env.ADMIN_PASSWORD!

export async function GET(req: NextRequest) {
  const pwd = req.nextUrl.searchParams.get('pwd')
  if (pwd !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/FormSito?select=*&order=created_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  )

  if (!res.ok) return NextResponse.json({ error: 'DB error' }, { status: 500 })
  const data = await res.json()
  return NextResponse.json(data)
}
