import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import type { NextAuthOptions } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/', // 로그인 페이지 커스텀 (필요한 경우)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Correctly export API route handlers for Next.js 15
const handler = NextAuth(authOptions);

export const GET = (req: NextRequest, res: NextResponse) => handler(req, res);
export const POST = (req: NextRequest, res: NextResponse) => handler(req, res);
