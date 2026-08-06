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
    const deposits = await sql`
      SELECT 
        dr.id, dr.amount_rs, dr.user_phone, dr.status, dr.method,
        dr.transaction_id, dr.screenshot_url, dr.notes,
        dr.requested_at, dr.confirmed_at,
        u.name as user_name, u.email as user_email,
        p.name as plan_name
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      JOIN plans p ON dr.plan_id = p.id
      ORDER BY dr.requested_at DESC
    `;
    return NextResponse.json({ deposits });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { depositId, action } = await req.json();

    if (action === 'confirm') {
      // Get deposit info
      const depResult = await sql`SELECT * FROM deposit_requests WHERE id = ${depositId}`;
      if (depResult.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const dep = depResult[0];

      if (dep.status !== 'pending') {
        return NextResponse.json({ error: 'Already processed' }, { status: 400 });
      }

      // Confirm deposit
      await sql`
        UPDATE deposit_requests SET status = 'confirmed', confirmed_at = NOW() WHERE id = ${depositId}
      `;

      // Activate user plan
      await sql`
        INSERT INTO user_plans (user_id, plan_id, started_at, expires_at, status)
        VALUES (
          ${dep.user_id},
          ${dep.plan_id},
          NOW(),
          NOW() + INTERVAL '30 days',
          'active'
        )
      `;

    } else if (action === 'reject') {
      await sql`
        UPDATE deposit_requests SET status = 'rejected' WHERE id = ${depositId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}