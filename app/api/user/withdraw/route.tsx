import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, jazzcashNumber, method } = await req.json();

    if (!amount || !jazzcashNumber) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const amountNum = parseFloat(amount);

    if (amountNum < 100) {
      return NextResponse.json({ error: 'Minimum withdrawal is Rs. 100' }, { status: 400 });
    }

    const userResult = await sql`SELECT cash_balance FROM users WHERE id = ${decoded.id}`;
    const user = userResult[0];

    if (parseFloat(user.cash_balance) < amountNum) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await sql`
      UPDATE users SET cash_balance = cash_balance - ${amountNum} WHERE id = ${decoded.id}
    `;

    await sql`
      INSERT INTO withdrawal_requests (user_id, diamonds_spent, amount_rs, ads_watched, jazzcash_number, method, status)
      VALUES (${decoded.id}, 0, ${amountNum}, 0, ${jazzcashNumber}, ${method}, 'pending')
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}