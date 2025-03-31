'use client';

import styles from './player.module.css';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

interface NowPlaying {
    title?: string;
    thumbnails?: { url: string }[];
    url?: string;
    info?: {
      thumbnail?: string;  // 여기에 thumbnail을 추가!
    };
  }

interface QueueItem {
  title: string;
  user_name: string;
}

interface SearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

export default function PlayerPage() {
  const params = useParams();
  const { data: session } = useSession();
  
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const fetchNowPlaying = async () => {
    if (typeof params.guildId === 'string') {
      try {
        const res = await fetch(`/api/music/now-playing?guildId=${params.guildId}`);
        const data = await res.json();
        setNowPlaying(data);
      } catch (error) {
        console.error('Failed to fetch now playing:', error);
      }
    }
  };

  const fetchQueue = async () => {
    if (typeof params.guildId === 'string') {
      try {
        const res = await fetch(`/api/music/queue?guildId=${params.guildId}`);
        const data = await res.json();
        setQueue(data);
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      }
    }
  };

  useEffect(() => {
    if (params.guildId) {
      fetchNowPlaying();
      fetchQueue();
    }
  }, [params.guildId]);

  const handleSearch = async () => {
    if (!params.guildId || typeof params.guildId !== 'string') return;

    try {
      if (input.startsWith("http")) {
        await fetch("/api/music/add", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            guildId: params.guildId,
            url: input,
            user_id: session?.user?.id,
            user_name: session?.user?.name,
          }),
        });
        setInput('');
        fetchQueue();
      } else {
        const res = await fetch(`/api/search?q=${encodeURIComponent(input)}`);
        const data = await res.json();
        setSearchResults(data.items);
      }
    } catch (error) {
      console.error('Search or add song error:', error);
    }
  };

  const addSearchedSong = async (videoId: string) => {
    if (!params.guildId || typeof params.guildId !== 'string') return;

    try {
      await fetch("/api/music/add", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guildId: params.guildId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          user_id: session?.user?.id,
          user_name: session?.user?.name,
        }),
      });
      setSearchResults([]);
      fetchQueue();
    } catch (error) {
      console.error('Add searched song error:', error);
    }
  };

  return (
    <div className={styles.back}>
    <div className={styles.container}>
      <h1 className={styles.title}>🎵 {nowPlaying ? "재생 중" : "노래를 재생중이지 않아요"}</h1>

      {nowPlaying && (
        <div className={styles.nowPlayingCard}>
          <img 
            src={nowPlaying?.info?.thumbnail || '/default_thumb.jpg'} 
            alt="thumbnail" 
            />
          <div>
            <h2>{nowPlaying.title}</h2>
            <a 
              href={nowPlaying.url} 
              target="_blank" 
              rel="noreferrer"
            >
              바로가기
            </a>
          </div>
        </div>
      )}

      <div className={styles.queueSection}>
        <h2>대기열</h2>
        {queue.map((item, i) => (
          <div key={i} className={styles.queueItem}>
            <p>{item.title}</p>
            <span>🎧 {item.user_name}</span>
          </div>
        ))}
      </div>

      <div className={styles.inputSection}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="검색어 또는 링크 입력"
        />
        <button onClick={handleSearch}>확인</button>
      </div>

      {searchResults.length > 0 && (
        <div className={styles.searchResults}>
          {searchResults.map((video, i) => (
            <div 
              key={i} 
              className={styles.resultCard} 
              onClick={() => addSearchedSong(video.id.videoId)}
            >
              <img 
                src={video.snippet.thumbnails.default.url} 
                alt="thumb" 
              />
              <div>
                <p>{video.snippet.title}</p>
                <small>{video.snippet.channelTitle}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}