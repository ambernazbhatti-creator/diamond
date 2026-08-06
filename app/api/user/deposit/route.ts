import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId, phone, method, transactionId, screenshotUrl, notes } = await req.json();

    if (!planId || !phone || !transactionId) {
      return NextResponse.json({ error: 'Phone number and Transaction ID are required' }, { status: 400 });
    }

    const planResult = await sql`SELECT * FROM plans WHERE id = ${planId}`;
    if (planResult.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const plan = planResult[0];

    await sql`
      INSERT INTO deposit_requests 
        (user_id, plan_id, amount_rs, user_phone, method, transaction_id, screenshot_url, notes, status)
      VALUES 
        (${decoded.id}, ${planId}, ${plan.price_rs}, ${phone}, ${method}, ${transactionId}, ${screenshotUrl ?? null}, ${notes ?? null}, 'pending')
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}