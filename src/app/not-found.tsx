import Link from 'next/link';
import styles from './404.module.css'; // 스타일 파일을 추가해 주세요.

export default function Custom404() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>페이지를 찾을 수 없어요.</p>
        <Link href="/" passHref>
          <button className={styles.homeButton}>홈으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}
