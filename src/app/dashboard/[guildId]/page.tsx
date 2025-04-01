'use client';

import styles from './player.module.css';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { FaPlay, FaPause, FaStepForward, FaVolumeUp, FaRandom, FaUndo } from 'react-icons/fa';
import { BiSearchAlt } from 'react-icons/bi';
import { MdOutlineQueueMusic, MdLibraryMusic } from 'react-icons/md';
import Image from 'next/image';

interface NowPlaying {
    title?: string;
    thumbnails?: { url: string }[];
    url?: string;
    info?: {
      thumbnail?: string;
      channel?: string;
      duration?: number;
    };
    duration?: string;
}

interface QueueItem {
  title: string;
  user_name: string;
  thumbnail?: string;
  duration?: string;
}

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
}

export default function PlayerPage() {
  const params = useParams();
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [guildInfo, setGuildInfo] = useState<{name: string, icon: string | null}>({name: '', icon: null});
  const [viewMode, setViewMode] = useState<'queue' | 'search'>('queue');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchGuildInfo = async () => {
    if (typeof params.guildId === 'string') {
      try {
        const res = await fetch(`/api/guilds/${params.guildId}`);
        const data = await res.json();
        setGuildInfo(data);
      } catch (error) {
        console.error('Failed to fetch guild info:', error);
      }
    }
  };

  const fetchNowPlaying = async () => {
    if (typeof params.guildId === 'string') {
      try {
        const res = await fetch(`/api/music/now-playing?guildId=${params.guildId}`);
        const data = await res.json();
        console.log(data)
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
      fetchGuildInfo();
      fetchNowPlaying();
      fetchQueue();

      // Set up polling for updates
      const intervalId = setInterval(() => {
        fetchNowPlaying();
        fetchQueue();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [params.guildId]);

  // Simulate progress bar
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isPlaying && nowPlaying) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev + 0.03;
        });
      }, 100);
    }

    return () => clearInterval(progressInterval);
  }, [isPlaying, nowPlaying]);

  const handleSearch = async () => {
    if (!params.guildId || typeof params.guildId !== 'string' || input.trim() === '') return;

    try {
      setSearchError(null);
      setIsSearching(true);
      
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
        setViewMode('queue');
      } else {
        setViewMode('search');
        const res = await fetch(`/api/search?q=${encodeURIComponent(input)}`);
        
        if (!res.ok) {
          throw new Error(`Search failed with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setSearchResults(data);
        } else if (data.items && Array.isArray(data.items)) {
          setSearchResults(data.items);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search or add song error:', error);
      setSearchError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addSearchedSong = async (videoId: string, title: string) => {
    if (!params.guildId || typeof params.guildId !== 'string') return;

    try {
      await fetch("/api/music/queue/add", {
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
      
      // Show a toast notification
      const toast = document.createElement('div');
      toast.className = styles.toast;
      toast.textContent = `"${title}" 추가됨`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
      
      fetchQueue();
      setViewMode('queue');
    } catch (error) {
      console.error('Add searched song error:', error);
    }
  };

  const handlePlayerControls = async (action: 'play' | 'pause' | 'skip') => {
    if (!params.guildId || typeof params.guildId !== 'string') return;

    try {
      await fetch(`/api/music/${action}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guildId: params.guildId,
        }),
      });

      if (action === 'play') setIsPlaying(true);
      if (action === 'pause') setIsPlaying(false);
      if (action === 'skip') {
        setProgress(0);
        setTimeout(() => {
          fetchNowPlaying();
          fetchQueue();
        }, 1000);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={styles.playerPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.guildInfo}>
            {guildInfo.icon ? (
              <Image
                src={`https://cdn.discordapp.com/icons/${params.guildId}/${guildInfo.icon}.webp`}
                alt={guildInfo.name}
                width={40}
                height={40}
                className={styles.guildIcon}
              />
            ) : (
              <div className={styles.defaultGuildIcon}>
                {guildInfo?.name?.charAt(0) || "?"}
              </div>
            )}
            <h1 className={styles.guildName}>{guildInfo.name}</h1>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.playerSection}>
            {nowPlaying ? (
              <>
                <div className={styles.albumArt}>
                  <Image
                    src={nowPlaying?.info?.thumbnail || '/default_thumb.jpg'}
                    alt="Album Art"
                    width={320}
                    height={320}
                    className={styles.albumImage}
                  />
                  <div className={styles.playingIndicator}>
                    <div className={styles.playingDot}></div>
                    <div className={styles.playingDot}></div>
                    <div className={styles.playingDot}></div>
                  </div>
                </div>
                
                <div className={styles.nowPlayingInfo}>
                  <h2 className={styles.songTitle}>{nowPlaying.title}</h2>
                  <p className={styles.artistName}>{nowPlaying.info?.channel || 'Unknown Artist'}</p>
                  
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className={styles.timeDisplay}>
                      <span>{formatTime(progress * 3)}</span>
                      <span>{nowPlaying.info?.duration !== undefined ? formatTime(nowPlaying.info.duration) : '3:00'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.controls}>
                    <button 
                      className={styles.controlButton}
                      onClick={() => handlePlayerControls('skip')}
                    >
                      <FaRandom />
                    </button>
                    <button 
                      className={`${styles.controlButton} ${styles.playPauseButton}`}
                      onClick={() => handlePlayerControls(isPlaying ? 'pause' : 'play')}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button 
                      className={styles.controlButton}
                      onClick={() => handlePlayerControls('skip')}
                    >
                      <FaStepForward />
                    </button>
                    <div className={styles.volumeControl}>
                      <FaVolumeUp />
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className={styles.volumeSlider}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyPlayer}>
                <MdLibraryMusic className={styles.emptyPlayerIcon} />
                <h2>현재 재생 중인 음악이 없습니다</h2>
                <p>여기에서 음악을 검색하거나 추가하세요</p>
              </div>
            )}
          </div>

          <div className={styles.sidePanel}>
            <div className={styles.searchSection}>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="노래, 아티스트 또는 YouTube 링크"
                  className={styles.searchInput}
                />
                <button 
                  onClick={handleSearch}
                  className={styles.searchButton}
                  disabled={isSearching}
                >
                  <BiSearchAlt />
                </button>
              </div>
            </div>

            <div className={styles.tabButtons}>
              <button 
                className={`${styles.tabButton} ${viewMode === 'queue' ? styles.activeTab : ''}`}
                onClick={() => setViewMode('queue')}
              >
                <MdOutlineQueueMusic /> 대기열
              </button>
              <button 
                className={`${styles.tabButton} ${viewMode === 'search' ? styles.activeTab : ''}`}
                onClick={() => {
                  if (viewMode !== 'search' || searchResults.length === 0) {
                    handleSearch();
                  }
                  setViewMode('search');
                }}
              >
                <BiSearchAlt /> 검색결과
              </button>
            </div>

            {viewMode === 'queue' && (
              <div className={styles.queueList}>
                <h3 className={styles.sectionTitle}>
                  대기열 <span className={styles.queueCount}>{queue.length}곡</span>
                </h3>
                {queue.length > 0 ? (
                  <div className={styles.queueItems}>
                    {queue.map((item, i) => (
                      <div key={i} className={styles.queueItem}>
                        <div className={styles.queueNumber}>{i + 1}</div>
                        <div className={styles.queueInfo}>
                          <span className={styles.queueTitle}>{item.title}</span>
                          <span className={styles.queueUser}>신청자: {item.user_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyQueue}>
                    <p>대기열이 비어있습니다</p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'search' && (
              <div className={styles.searchResults}>
                <h3 className={styles.sectionTitle}>
                  검색 결과 <span className={styles.queueCount}>{searchResults ? searchResults.length : 0}곡</span>
                </h3>
                {isSearching ? (
                  <div className={styles.loadingSearch}>
                    <p>검색 중...</p>
                  </div>
                ) : searchError ? (
                  <div className={styles.searchError}>
                    <p>{searchError}</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className={styles.searchItems}>
                    {searchResults.map((video, i) => (
                      <div 
                        key={i} 
                        className={styles.searchItem}
                        onClick={() => addSearchedSong(video.id, video.title)}
                      >
                        <div className={styles.searchThumbnail}>
                          <Image 
                            src={video.thumbnail} 
                            alt="Thumbnail" 
                            width={120}
                            height={68}
                          />
                          <div className={styles.addOverlay}>
                            <FaPlay />
                          </div>
                        </div>
                        <div className={styles.searchInfo}>
                          <span className={styles.searchTitle}>{video.title}</span>
                          <span className={styles.searchChannel}>{video.channel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptySearch}>
                    <p>검색 결과가 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}