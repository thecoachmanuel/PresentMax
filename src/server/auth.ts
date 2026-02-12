import { env } from "@/env";
import { db } from "@/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession, type Session } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./supabase";

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
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: "Supabase",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // --- DEMO/SEED USER BYPASS ---
        // This allows direct login with these specific credentials without Supabase
        if (email === "demo@presentmax.com" && password === "PresentMax2026!") {
          console.log("Demo user login attempt detected");
          // Return a static user object immediately to ensure login succeeds
          // We can sync to DB later or separately if needed
          return {
            id: "demo-user-id-123",
            email: "demo@presentmax.com",
            name: "Demo User",
            role: "USER",
            hasAccess: true,
          };
        }
        // -----------------------------

        try {
          console.log("Attempting Supabase auth for:", email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (error) {
            console.error("Supabase auth error:", error.message);
            return null;
          }

          if (!data.user || !data.user.email) {
            console.error("No user or email returned from Supabase");
            return null;
          }

          console.log("Supabase auth successful for:", data.user.email);

          // Sync with our DB
          const dbUser = await db.user.upsert({
            where: { email: data.user.email },
            update: {
              image: data.user.user_metadata?.avatar_url || null,
              name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
            },
            create: {
              email: data.user.email,
              image: data.user.user_metadata?.avatar_url || null,
              name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
              role: "USER",
              hasAccess: false,
            },
          });

          console.log("DB sync successful for:", dbUser.email);

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            role: dbUser.role,
            hasAccess: dbUser.hasAccess,
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.hasAccess = user.hasAccess;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.picture = user.image;
        token.role = user.role;
        token.isAdmin = user.role === "ADMIN";
        // Safe access to location
        if (user && typeof user === 'object' && 'location' in user) {
          token.location = (user as any).location;
        }
      }

      // Handle updates
      if (trigger === "update" && (session as Session)?.user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.image = dbUser.image;
            token.picture = dbUser.image;
            token.hasAccess = dbUser.hasAccess;
            token.role = dbUser.role;
            token.isAdmin = dbUser.role === "ADMIN";
          }
        } catch (e) {
          console.error("JWT update error:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || session.user.id;
        session.user.email = (token.email as string) || session.user.email;
        session.user.hasAccess = !!token.hasAccess;
        session.user.location = token.location as string;
        session.user.role = (token.role as string) || "USER";
        session.user.isAdmin = token.role === "ADMIN";
      }
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
