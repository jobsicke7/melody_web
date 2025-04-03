import { getDb } from "@/lib/mongodb";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { unstable_noStore as noStore } from 'next/cache';
import ReactMarkdown from "react-markdown";
import { ComponentProps } from "react";
import remarkGfm from "remark-gfm";

interface CodeProps extends ComponentProps<"code"> {
  inline?: boolean;
}
interface Author {
  id: string | number;
  name: string;
  avatar: string;
}

interface Notice {
  _id: any;
  title: string;
  content: string;
  author: Author;
  created_at: Date;
  updated_at: Date | null;
}

async function getNotices(): Promise<Notice[]> {
  noStore(); // 캐시 비활성화

  try {
    const db = await getDb();
    const notices = await db.collection("noticelist")
      .find({})
      .sort({ created_at: -1 }) // 최신순 정렬
      .limit(10) // 최근 10개만 가져오기
      .toArray();
    
    return notices.map((notice: any) => ({
      ...notice,
      _id: notice._id,
      created_at: new Date(notice.created_at),
      updated_at: notice.updated_at ? new Date(notice.updated_at) : null
    }));
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
}

export default async function AnnouncePage() {
  const notices = await getNotices();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>공지사항</h1>
          <p className={styles.subtitle}>커뮤니티에 올라온 공지사항을 확인하세요.</p>
        </header>

        <div className={styles.list}>
          {notices.length > 0 ? (
            notices.map((notice: Notice) => (
              <div key={notice._id.toString()} className={styles.noticeItem}>
                <div className={styles.noticeHeader}>
                  <Image 
                    src={notice.author?.avatar || "/default-avatar.png"} 
                    alt={notice.author?.name || "사용자"}
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                  <div>
                    <h3 className={styles.authorName}>{notice.author?.name || "알 수 없음"}</h3>
                    <p className={styles.timestamp}>
                      {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true, locale: ko })}
                      {notice.updated_at && <span className={styles.edited}>(수정됨)</span>}
                    </p>
                  </div>
                </div>

                <h2 className={styles.noticeTitle}>{notice.title}</h2>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]} // ✅ GFM 플러그인 추가 (줄바꿈 지원)
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: "#4fa3d1" }} />
                    ),
                    code: ({ inline, children, ...props }: CodeProps) =>
                      inline ? (
                        <code
                          style={{
                            backgroundColor: "#2b2d31",
                            color: "#f8c555",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre
                          style={{
                            backgroundColor: "#2b2d31",
                            color: "#f8c555",
                            padding: "1rem",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                            overflowX: "auto",
                          }}
                        >
                          <code {...props}>{children}</code>
                        </pre>
                      ),
                    p: ({ node, ...props }) => <p style={{ whiteSpace: "pre-wrap" }} {...props} />, // ✅ 줄바꿈 유지
                  }}
                >
                  {notice.content}
                </ReactMarkdown>

              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 더 많은 공지 보기 버튼 */}
        <div className={styles.moreButtonWrapper}>
          <Link href="https://discord.gg/kW3tXNEWNs" target="_blank" rel="noopener noreferrer">
            <button className={styles.moreButton}>더 많은 공지사항은 커뮤니티에서 확인하세요</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
