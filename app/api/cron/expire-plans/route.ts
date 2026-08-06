import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      UPDATE user_plans
      SET status = 'expired'
      WHERE status = 'active' AND expires_at < NOW()
      RETURNING id
    `;
    return NextResponse.json({ expired: result.length });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}