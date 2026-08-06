import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token!) as { id: number } | null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's referral code and earnings
    const userResult = await sql`
      SELECT referral_code, referral_earnings FROM users WHERE id = ${decoded.id}
    `;
    const user = userResult[0];

    // Get team members
    const team = await sql`
      SELECT 
        u.id, u.name, u.created_at,
        COUNT(DISTINCT dr.id) FILTER (WHERE dr.status = 'confirmed') as has_bought,
        EXISTS(SELECT 1 FROM deposit_requests dr2 WHERE dr2.user_id = u.id AND dr2.status = 'confirmed') as bought_plan
      FROM users u
      LEFT JOIN deposit_requests dr ON u.id = dr.user_id
      WHERE u.referred_by = ${decoded.id}
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    // Get bonus history
    const bonuses = await sql`
      SELECT 
        rb.bonus_type, rb.amount_rs, rb.team_size_at_time, rb.created_at,
        u.name as referred_name
      FROM referral_bonuses rb
      JOIN users u ON rb.referred_id = u.id
      WHERE rb.referrer_id = ${decoded.id}
      ORDER BY rb.created_at DESC
      LIMIT 30
    `;

    // Current team size and tier info
    const teamSize = team.length;
    const currentBonus = teamSize >= 31 ? 30 : teamSize >= 11 ? 20 : 10;
    const nextTier = teamSize < 11 ? { at: 11, bonus: 20 } : teamSize < 31 ? { at: 31, bonus: 30 } : null;

    return NextResponse.json({
      referralCode: user.referral_code,
      referralEarnings: user.referral_earnings,
      teamSize,
      currentBonusPerAction: currentBonus,
      nextTier,
      team,
      bonuses,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}