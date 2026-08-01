import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  const token =
    req.cookies.get("nexerp-token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  // For client navigation, auth is in localStorage (checked client-side)
  // Middleware just lets through; client-side redirect handles unauthenticated
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
