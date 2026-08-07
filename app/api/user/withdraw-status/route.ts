import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await sql`
      SELECT withdrawal_unlocks, withdrawals_used, cash_balance
      FROM users WHERE id = ${decoded.id}
    `;
    const user = result[0];

    const available = user.withdrawal_unlocks - user.withdrawals_used;

    return NextResponse.json({
      withdrawalUnlocks: user.withdrawal_unlocks,
      withdrawalsUsed: user.withdrawals_used,
      availableWithdrawals: available,
      isUnlocked: available > 0,
      cashBalance: user.cash_balance,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}