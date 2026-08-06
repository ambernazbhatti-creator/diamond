import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    const decoded = verifyToken(token!) as { role: string } | null;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [users, deposits, withdrawals, pendingDeposits, pendingWithdrawals] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count, COALESCE(SUM(amount_rs), 0) as total FROM deposit_requests WHERE status = 'confirmed'`,
      sql`SELECT COUNT(*) as count, COALESCE(SUM(amount_rs), 0) as total FROM withdrawal_requests WHERE status = 'paid'`,
      sql`SELECT COUNT(*) as count FROM deposit_requests WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = 'pending'`,
    ]);

    return NextResponse.json({
      stats: {
        totalUsers: users[0].count,
        totalDeposits: deposits[0].total,
        totalWithdrawals: withdrawals[0].total,
        pendingDeposits: pendingDeposits[0].count,
        pendingWithdrawals: pendingWithdrawals[0].count,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}