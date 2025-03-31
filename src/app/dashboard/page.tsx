'use client';

import styles from './dashboard.module.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  bot_in: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuilds = async () => {
      const res = await fetch('/api/guilds');
      const data = await res.json();
      if (res.ok) {
        const sorted = data.sort((a: Guild, b: Guild) => {
          if (a.bot_in && !b.bot_in) return -1;
          if (!a.bot_in && b.bot_in) return 1;
          return a.name.localeCompare(b.name);
        });
        setGuilds(sorted);
      }
      setLoading(false);
    };
    fetchGuilds();
  }, []);

  if (loading || status === 'loading') {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>내 서버 목록</h1>
      <div className={styles.guildList}>
        {guilds.map((guild) => (
          <div key={guild.id} className={styles.guildCard}>
            <Image
              src={
                guild.icon
                  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`
                  : '/images/default-server.png'
              }
              alt={guild.name}
              width={64}
              height={64}
              className={styles.guildIcon}
            />
            <div className={styles.guildInfo}>
              <div className={styles.guildName}>{guild.name}</div>
              {guild.bot_in ? (
                <Link href={`/dashboard/${guild.id}`} className={styles.playerButton}>
                  음악 플레이어
                </Link>
              ) : (
                <a
                  href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=274877975552&scope=bot+applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                  className={styles.inviteButton}
                >
                  서버에 초대하기
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}