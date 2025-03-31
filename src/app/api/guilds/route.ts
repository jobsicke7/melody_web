'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userGuildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!userGuildsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch user guilds' }, { status: 500 });
  }

  const userGuilds = await userGuildsRes.json();

  const botGuildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
  });

  const botGuildsJson = await botGuildsRes.json();

  if (!Array.isArray(botGuildsJson)) {
    console.error('Bot guilds response is not an array:', botGuildsJson);
    return NextResponse.json({ error: 'Unexpected bot guilds response' }, { status: 500 });
  }

  const botGuildIds = new Set(botGuildsJson.map((g: any) => g.id));

  const mutualGuilds = userGuilds.filter((g: any) => (g.permissions & 0x20) === 0x20); // MANAGE_GUILD 권한 보유

  const result = mutualGuilds.map((guild: any) => ({
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    bot_in: botGuildIds.has(guild.id),
  }));

  return NextResponse.json(result);
}
