import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deposits = await sql`
      SELECT dr.id, dr.amount_rs, dr.status, dr.method, dr.requested_at, p.name as plan_name
      FROM deposit_requests dr
      JOIN plans p ON dr.plan_id = p.id
      WHERE dr.user_id = ${decoded.id}
      ORDER BY dr.requested_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ deposits });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}