import { env } from "@/env";
import { db } from "@/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession, type Session } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      hasAccess: boolean;
      location?: string;
      role: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    hasAccess: boolean;
    role: string;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as Adapter,
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.name = user.name;
        token.email = user.email; // Ensure email is in token
        token.image = user.image;
        token.picture = user.image;
        token.location = (user as Session["user"]).location;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
      }

      // Handle updates
      if (trigger === "update" && (session as Session)?.user) {
        try {
          const user = await db.user.findUnique({
            where: { id: token.id as string },
          });
          if (session) {
            token.name = (session as Session).user.name;
            token.image = (session as Session).user.image;
            token.picture = (session as Session).user.image;
            token.location = (session as Session).user.location;
            token.role = (session as Session).user.role;
            token.isAdmin = (session as Session).user.role === "ADMIN";
          }
          if (user) {
            token.hasAccess = user?.hasAccess ?? false;
            token.role = user.role;
            token.isAdmin = user.role === "ADMIN";
          }
        } catch (error) {
          console.error("Database error during jwt update:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string; // Ensure email is in session
      session.user.hasAccess = token.hasAccess as boolean;
      session.user.location = token.location as string;
      session.user.role = token.role as string;
      session.user.isAdmin = token.role === "ADMIN";
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if email is missing
          if (!user.email) {
            console.error("No email provided by Google");
            return false;
          }

          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true, hasAccess: true, role: true },
          });

          if (dbUser) {
            user.hasAccess = dbUser.hasAccess;
            user.role = dbUser.role;
          } else {
            // New user via Google - PrismaAdapter handles creation, but we set defaults here
            user.hasAccess = false;
            user.role = "USER";
          }
        } catch (error) {
          console.error("Database error during signIn:", error);
          // Return true to allow sign in to continue if it's a DB connection issue
          // PrismaAdapter will try to create/link the user anyway
          return true;
        }
      }

      return true;
    },
  },
});
