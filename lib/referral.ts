import sql from '@/lib/db';

export function getBonusAmount(teamSize: number): number {
  if (teamSize >= 31) return 30;
  if (teamSize >= 11) return 20;
  return 10;
}

export async function getTeamSize(userId: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM users WHERE referred_by = ${userId}
  `;
  return parseInt(result[0].count);
}

export async function payReferralBonus(
  referrerId: number,
  referredId: number,
  bonusType: 'signup' | 'plan_purchase'
) {
  const teamSize = await getTeamSize(referrerId);
  const amount = getBonusAmount(teamSize);

  await sql`
    UPDATE users 
    SET cash_balance = cash_balance + ${amount},
        referral_earnings = referral_earnings + ${amount}
    WHERE id = ${referrerId}
  `;

  await sql`
    INSERT INTO referral_bonuses (referrer_id, referred_id, bonus_type, amount_rs, team_size_at_time)
    VALUES (${referrerId}, ${referredId}, ${bonusType}, ${amount}, ${teamSize})
  `;

  // When a referred user buys a plan, give referrer 10 withdrawal unlocks
  if (bonusType === 'plan_purchase') {
    await sql`
      UPDATE users SET withdrawal_unlocks = withdrawal_unlocks + 10 WHERE id = ${referrerId}
    `;
  }

  return amount;
}