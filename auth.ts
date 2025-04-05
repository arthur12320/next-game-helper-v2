import db from "@/db";
import { allowedUsers } from "@/db/schema"; // Import allowed users table
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }) as any,
  ],
  adapter: DrizzleAdapter(db),
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false; // Reject if no email

      const isAllowed = await db.query.allowedUsers.findFirst({
        where: eq(allowedUsers.email, user.email),
      });

      if (!isAllowed) {
        console.log(`Unauthorized login attempt: ${user.email}`);
        return false; // Reject login
      }

      return true; // Allow login
    },
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/auth/error',
  }
});