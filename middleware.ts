import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/first-time-setup",
  "/_next",
  "/favicon.ico",
  "/public",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get user/session from cookies (set by Supabase client)
  const session = req.cookies.get("sb-access-token")?.value;
  const role = req.cookies.get("sb-role")?.value;

  // If not authenticated, redirect to login
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect("/");
  }
  if (pathname.startsWith("/supervisor") && role !== "supervisor") {
    return NextResponse.redirect("/");
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect("/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
