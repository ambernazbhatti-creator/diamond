import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/packages', '/withdraw', '/history'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const adminToken = req.cookies.get('admin_token')?.value;

  // Admin routes
  if (adminRoutes.some(r => pathname.startsWith(r))) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (!adminToken || !verifyToken(adminToken)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // Protected user routes
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (authRoutes.includes(pathname)) {
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};