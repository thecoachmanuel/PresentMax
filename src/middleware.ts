import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicFile = pathname.includes(".") || pathname.startsWith("/_next");

  console.log(`Middleware: ${pathname} [isLoggedIn: ${!!session}]`);

  // Always redirect from root to /presentation
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // If user is on auth page but already signed in, redirect to dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // Protected routes: everything except auth, api, and public files
  if (!session && !isAuthPage && !isApiRoute && !isPublicFile) {
    const searchParams = new URLSearchParams({
      callbackUrl: request.url,
    });
    return NextResponse.redirect(new URL(`/auth/signin?${searchParams}`, request.url));
  }

  return NextResponse.next();
}

// Add routes that should be protected by authentication
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
