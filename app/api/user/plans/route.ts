import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plans = await sql`
      SELECT 
        up.id,
        p.name as plan_name,
        p.daily_diamonds,
        up.expires_at,
        up.last_collected_at,
        up.status
      FROM user_plans up
      JOIN plans p ON up.plan_id = p.id
      WHERE up.user_id = ${decoded.id} AND up.status = 'active'
      ORDER BY up.created_at DESC
    `;

    return NextResponse.json({ plans });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}