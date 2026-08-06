import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const withdrawals = await sql`
      SELECT id, diamonds_spent, amount_rs, status, method, requested_at, paid_at
      FROM withdrawal_requests
      WHERE user_id = ${decoded.id}
      ORDER BY requested_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ withdrawals });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}