import { getDb } from "@/lib/mongodb";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import styles from "./page.module.css";
import { unstable_noStore as noStore } from 'next/cache';

// 타입 정의
interface Author {
  id: string | number;
  name: string;
  avatar: string;
}

interface Message {
  guild_id: number;
  channel_id: number;
  message_id: number;
}

interface Notice {
  _id: any;
  title: string;
  content: string;
  author: Author;
  created_at: Date;
  updated_at: Date | null;
  messages: Message[];
}

async function getNotices(): Promise<Notice[]> {
  // 캐시를 비활성화하여 매번 새로운 데이터를 가져오도록 설정
  noStore();
  
  try {
    const db = await getDb();
    // 데이터베이스 컬렉션 목록 확인 (디버깅용)
    const collections = await db.listCollections().toArray();
    // 컬렉션 이름이 정확한지 확인
    const notices = await db.collection("noticelist").find({}).toArray();
    
    if (!notices || notices.length === 0) {
      console.log("No notices found in the collection");
      return [];
    }
    
    return notices.map((notice: any) => ({
      ...notice,
      _id: notice._id, // 수정: *id 대신 _id 사용
      created_at: new Date(notice.created_at),
      updated_at: notice.updated_at ? new Date(notice.updated_at) : null
    }));
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
}

export default async function AnnouncePage() {
  // 매번 새로운 데이터를 가져옴
  const notices = await getNotices();
  
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>공지사항</h1>
          <p className={styles.subtitle}>커뮤니티에 올라온 공지를 보여줍니다.</p>
        </header>
        
        <div className={styles.grid}>
          {notices && notices.length > 0 ? (
            notices.map((notice: Notice) => (
              <article 
                key={notice._id ? notice._id.toString() : Math.random().toString()}
                className={styles.card}
              >
                <div className={styles.cardContent}>
                  <div className={styles.authorBox}>
                    <div className={styles.avatarWrapper}>
                      <Image 
                        src={notice.author?.avatar || "/default-avatar.png"} 
                        alt={notice.author?.name || "사용자"}
                        className={styles.avatar}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div>
                      <h3 className={styles.authorName}>{notice.author?.name || "알 수 없음"}</h3>
                      <p className={styles.timestamp}>
                        {formatDistanceToNow(new Date(notice.created_at), { 
                          addSuffix: true,
                          locale: ko
                        })}
                        {notice.updated_at && (
                          <span className={styles.edited}>(수정됨)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <h2 className={styles.noticeTitle}>{notice.title}</h2>
                  <div className={styles.noticeContent}>
                    <p>{notice.content}</p>
                  </div>
                </div>
                
                <div className={styles.cardFooter}>
                  {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </article>
            ))
          ) : (
            <div className={styles.empty}>
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}