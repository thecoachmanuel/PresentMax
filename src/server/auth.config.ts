import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";

export const authConfig = {
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".");

      // Always allow public routes
      if (isPublicRoute) return true;

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/presentation", nextUrl));
        return true;
      }

      if (!isLoggedIn && !isApiRoute) {
        return false; // Redirect to login
      }

      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
