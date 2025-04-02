'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const CommandsPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        const response = await fetch('https://credit-cdn-internal.wakcareers.com/help.txt');
        
        if (!response.ok) {
          throw new Error('Failed to fetch commands');
        }
        
        const text = await response.text();
        
        // 패턴을 수정하여 # 뒤에 공백이 있을 수 있는 경우도 처리
        const categoryMatches = text.match(/#([^\n]+)/g);
        if (categoryMatches) {
          // 각 카테고리에서 #을 제거하고 불필요한 공백을 처리
          const extractedCategories = categoryMatches.map(cat => cat.replace('#', '').trim());
          setCategories(extractedCategories);
        }
      } catch (err) {
        setError('명령어를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.error('Error fetching commands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, []);

  if (loading) {
    return <div className={styles.loading}></div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>명령어</h1>
      <p className={styles.description}>멜로가 제공하는 다양한 명령어를 확인해보세요.</p>
      
      <div className={styles.categoryGrid}>
        {categories.map((category, index) => (
          <Link href={`/commands/${encodeURIComponent(category)}`} key={index} className={styles.categoryCard}>
            <div className={styles.cardContent}>
              <h2>{category}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CommandsPage;
