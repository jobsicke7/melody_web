import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions: NextAuthOptions = {
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
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handler separately
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };