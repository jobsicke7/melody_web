import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import type { NextAuthOptions } from 'next-auth';
import { NextRequest } from 'next/server';

const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: 'https://discord.com/api/oauth2/authorize?scope=identify+email+guilds',
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

// Next.js 14, 15 API Route Fix: Only pass `req`
const handler = NextAuth(authOptions);

export const GET = (req: NextRequest) => {
  return handler(req);
};
export const POST = (req: NextRequest) => {
  return handler(req);
};