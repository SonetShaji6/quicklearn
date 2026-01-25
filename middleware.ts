import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "./lib/auth";

const PROTECTED_ADMIN_PATHS = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAdmin = PROTECTED_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!needsAdmin) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const payload = await verifyAuthToken(token);
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
