import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token from cookies
  const sessionCookie = getSessionCookie(request);

  // If user is authenticated and tries to access landing page, redirect to dashboard
  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (sessionCookie && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to signin
  if (
    !sessionCookie &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/reader"))
  ) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/auth/:path*", "/reader:path*"],
};
