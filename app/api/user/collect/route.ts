import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userPlanId } = await req.json();

    // Get the plan and verify ownership
    const planResult = await sql`
      SELECT up.*, p.daily_diamonds
      FROM user_plans up
      JOIN plans p ON up.plan_id = p.id
      WHERE up.id = ${userPlanId} AND up.user_id = ${decoded.id} AND up.status = 'active'
    `;

    if (planResult.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const plan = planResult[0];

    // Check 24hr cooldown
    if (plan.last_collected_at) {
      const diff = Date.now() - new Date(plan.last_collected_at).getTime();
      if (diff < 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: 'Already collected today' }, { status: 400 });
      }
    }

    const diamonds = plan.daily_diamonds;

    // Update plan last_collected_at
    await sql`
      UPDATE user_plans SET last_collected_at = NOW() WHERE id = ${userPlanId}
    `;

    // Add diamonds to user balance
    await sql`
      UPDATE users SET diamond_balance = diamond_balance + ${diamonds} WHERE id = ${decoded.id}
    `;

    // Log the collection
    await sql`
      INSERT INTO diamond_collections (user_id, user_plan_id, diamonds_earned)
      VALUES (${decoded.id}, ${userPlanId}, ${diamonds})
    `;

    return NextResponse.json({ success: true, diamonds });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}