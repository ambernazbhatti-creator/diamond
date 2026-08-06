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
    const withdrawals = await sql`
      SELECT 
        wr.id, wr.diamonds_spent, wr.amount_rs, wr.ads_watched,
        wr.jazzcash_number, wr.status, wr.method,
        wr.requested_at, wr.paid_at,
        u.name as user_name, u.email as user_email
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      ORDER BY wr.requested_at DESC
    `;
    return NextResponse.json({ withdrawals });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { withdrawalId, action } = await req.json();

    if (action === 'approve') {
      await sql`
        UPDATE withdrawal_requests SET status = 'approved' WHERE id = ${withdrawalId}
      `;
    } else if (action === 'paid') {
      await sql`
        UPDATE withdrawal_requests SET status = 'paid', paid_at = NOW() WHERE id = ${withdrawalId}
      `;
    } else if (action === 'reject') {
      // Refund diamonds to user
      const wrResult = await sql`SELECT * FROM withdrawal_requests WHERE id = ${withdrawalId}`;
      if (wrResult.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const wr = wrResult[0];

      await sql`
        UPDATE users SET diamond_balance = diamond_balance + ${wr.diamonds_spent} WHERE id = ${wr.user_id}
      `;
      await sql`
        UPDATE withdrawal_requests SET status = 'rejected' WHERE id = ${withdrawalId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}