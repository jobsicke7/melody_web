'use client';

import styles from './dashboard.module.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaCrown, FaShieldAlt } from 'react-icons/fa';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  bot_in: boolean;
  userRole?: 'owner' | 'admin' | 'member';
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
        // Fetch user roles for each guild
        const guildsWithRoles = await Promise.all(
          data.map(async (guild: Guild) => {
            try {
              const roleRes = await fetch(`/api/guilds/${guild.id}/role`);
              if (roleRes.ok) {
                const roleData = await roleRes.json();
                return { ...guild, userRole: roleData.role };
              }
            } catch (error) {
              console.error(`Failed to fetch role for guild ${guild.id}:`, error);
            }
            return guild;
          })
        );
        
        const sorted = guildsWithRoles.sort((a: Guild, b: Guild) => {
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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>서버 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>내 디스코드 서버</h1>
      <p className={styles.subtitle}>음악 재생 서비스를 이용할 서버를 선택하세요</p>
      
      <div className={styles.guildList}>
        {guilds.map((guild) => (
          <div key={guild.id} className={styles.guildCard}>
            <div className={styles.guildHeader}>
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
              <div className={styles.guildTitleContainer}>
                <div className={styles.guildName}>{guild.name}</div>
                <div className={styles.roleIndicator}>
                  {guild.userRole === 'owner' && (
                    <span className={styles.ownerRole}>
                      <FaCrown className={styles.roleIcon} /> 서버 소유자
                    </span>
                  )}
                  {guild.userRole === 'admin' && (
                    <span className={styles.adminRole}>
                      <FaShieldAlt className={styles.roleIcon} /> 관리자
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.guildActions}>
              {guild.bot_in ? (
                <Link href={`/dashboard/${guild.id}`} className={styles.playerButton}>
                  음악 플레이어 열기
                </Link>
              ) : (
                <a
                  href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=274877975552&scope=bot+applications.commands&guild_id=${guild.id}&disable_guild_select=true`}
                  className={styles.inviteButton}
                >
                  서버에 봇 초대하기
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}