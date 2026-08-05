import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const plans = await sql`SELECT * FROM plans ORDER BY price_rs ASC`;
    return NextResponse.json({ plans });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}