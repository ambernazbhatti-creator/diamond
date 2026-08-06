import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const collections = await sql`
      SELECT dc.id, dc.diamonds_earned as cash_earned, dc.collected_at, p.name as plan_name
      FROM diamond_collections dc
      JOIN user_plans up ON dc.user_plan_id = up.id
      JOIN plans p ON up.plan_id = p.id
      WHERE dc.user_id = ${decoded.id}
      ORDER BY dc.collected_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ collections });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}