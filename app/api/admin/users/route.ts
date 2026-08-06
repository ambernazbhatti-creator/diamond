import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const decoded = verifyToken(token!) as { role: string } | null;
  return decoded?.role === 'admin';
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const users = await sql`
      SELECT 
        u.id, u.name, u.email, u.phone, u.cash_balance, u.created_at,
        COUNT(DISTINCT up.id) FILTER (WHERE up.status = 'active') as active_plans,
        COUNT(DISTINCT dr.id) FILTER (WHERE dr.status = 'confirmed') as total_deposits,
        COALESCE(SUM(dr.amount_rs) FILTER (WHERE dr.status = 'confirmed'), 0) as total_deposited
      FROM users u
      LEFT JOIN user_plans up ON u.id = up.user_id
      LEFT JOIN deposit_requests dr ON u.id = dr.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}