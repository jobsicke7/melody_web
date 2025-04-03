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
      try {
        const res = await fetch('/api/guilds');
        if (!res.ok) {
          console.error('Failed to fetch guilds');
          return;
        }

        const data = await res.json();
        const guildsWithRoles = await Promise.all(
          data.map(async (guild: Guild) => {
            try {
              const roleRes = await fetch(`/api/guilds/${guild.id}/role`);
              if (roleRes.ok) {
                const roleData = await roleRes.json();
                return { ...guild, userRole: roleData.role };
              }
              return guild;
            } catch (error) {
              console.error(`Failed to fetch role for guild ${guild.id}:`, error);
              return guild;
            }
          })
        );

        const sorted = guildsWithRoles.sort((a: Guild, b: Guild) => {
          if (a.bot_in && !b.bot_in) return -1;
          if (!a.bot_in && b.bot_in) return 1;
          return a.name.localeCompare(b.name);
        });

        setGuilds(sorted);
      } catch (error) {
        console.error('Error fetching guilds:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchGuilds();
    }
  }, [session]);

  if (loading || status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>서버 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>멜로봇 대시보드</h1>
      <p className={styles.subtitle}>간편하게 멜로봇을 관리해보세요</p>
      <div className={styles.guildList}>
        {guilds.map((guild) => (
          <div key={guild.id} className={styles.guildCard}>
            <div className={styles.guildHeader}>
              {guild.icon ? (
                <Image
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`}
                  alt={guild.name}
                  width={64}
                  height={64}
                  className={styles.guildIcon}
                />
              ) : (
                <div className={styles.guildIconFallback}>
                  {guild.name.charAt(0)}
                </div>
              )}
              <div className={styles.guildTitleContainer}>
                <h2 className={styles.guildName}>{guild.name}</h2>
                {guild.userRole && (
                  <div className={styles.roleIndicator}>
                    {guild.userRole === 'owner' && (
                      <span className={styles.ownerRole}>
                        <FaCrown className={styles.roleIcon} />
                        서버 소유자
                      </span>
                    )}
                    {guild.userRole === 'admin' && (
                      <span className={styles.adminRole}>
                        <FaShieldAlt className={styles.roleIcon} />
                        관리자
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.guildActions}>
              {guild.bot_in ? (
                <Link href={`/dashboard/${guild.id}`} className={styles.playerButton}>
                  음악 플레이어 열기
                </Link>
              ) : (
                <a
                  href={`https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdev.jobsickes.shop%2Finvitethanks&integration_type=0&scope=identify+bot+applications.commands&guild_id=${guild.id}`}
                  className={styles.inviteButton}
                  target="_blank"
                  rel="noopener noreferrer"
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