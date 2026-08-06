import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: process.env.PAYMENT_NAME,
    jazzcash: process.env.PAYMENT_JAZZCASH,
    easypaisa: process.env.PAYMENT_EASYPAISA,
  });
}