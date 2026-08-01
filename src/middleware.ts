import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/login', '/signup'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  const auth = req.cookies.get('nexerp-auth')?.value
    || req.headers.get('Authorization');

  // Auth state is in localStorage (client-side Zustand persist).
  // The actual guard is enforced in the ERP layout (client component).
  // This middleware handles SSR edge cases only.
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'] };
