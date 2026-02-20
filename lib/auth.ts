// ── FILE: lib/auth.ts ─────────────────────────────────────────────────────────
// Central NextAuth config — one hardcoded principal account.
// No database needed — credentials live in env vars so they're
// never committed to source code.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Simple string comparison — no bcrypt needed for a single
        // hardcoded account in a demo/assignment context
        const validEmail    = credentials.email    === process.env.PRINCIPAL_EMAIL;
        const validPassword = credentials.password === process.env.PRINCIPAL_PASSWORD;

        if (!validEmail || !validPassword) return null;

        // Return user object — this gets stored in the JWT
        return {
          id:    "principal",
          name:  "Principal",
          email: credentials.email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",   // our custom login page
    error:  "/login",   // auth errors go back to login
  },

  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 hours — one school day
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.name = "Principal";
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
