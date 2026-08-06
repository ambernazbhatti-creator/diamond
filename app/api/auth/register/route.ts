import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword, signToken, generateReferralCode } from '@/lib/auth';
import { payReferralBonus } from '@/lib/referral';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Check referral code
    let referrerId: number | null = null;
    if (referralCode) {
      const referrer = await sql`
        SELECT id FROM users WHERE referral_code = ${referralCode.toUpperCase()}
      `;
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
      }
    }

    const password_hash = await hashPassword(password);
    const newReferralCode = generateReferralCode();

    const result = await sql`
      INSERT INTO users (name, email, password_hash, referral_code, referred_by)
      VALUES (${name}, ${email}, ${password_hash}, ${newReferralCode}, ${referrerId})
      RETURNING id, name, email
    `;

    const user = result[0];

    // Pay signup bonus to referrer
    if (referrerId) {
      await payReferralBonus(referrerId, user.id, 'signup');
    }

    const token = signToken({ id: user.id, email: user.email, role: 'user' });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}