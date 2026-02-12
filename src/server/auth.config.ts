import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/env";

export const authConfig = {
  trustHost: true,
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

      // Always allow root to redirect (handled in middleware or here)
      if (nextUrl.pathname === "/") return true;

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
