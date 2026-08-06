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
    const refunds = await sql`
      SELECT 
        up.id, up.started_at, up.expires_at, up.refund_status,
        u.name as user_name, u.email as user_email,
        p.name as plan_name, p.price_rs
      FROM user_plans up
      JOIN users u ON up.user_id = u.id
      JOIN plans p ON up.plan_id = p.id
      WHERE up.status = 'expired' AND up.refund_status = 'pending'
      ORDER BY up.expires_at ASC
    `;
    return NextResponse.json({ refunds });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { planId } = await req.json();

    await sql`
      UPDATE user_plans SET refund_status = 'completed' WHERE id = ${planId}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}