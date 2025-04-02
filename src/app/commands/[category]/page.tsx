// app/commands/[category]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './category.module.css';
import ReactMarkdown from 'react-markdown';

interface Command {
  name: string;
  description: string;
}

interface CategoryData {
  name: string;
  description: string;
  commands: Command[];
}

const CategoryPage = () => {
  const params = useParams();
  const categoryName = decodeURIComponent(params.category as string);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch('https://credit-cdn-internal.wakcareers.com/help.txt');
        
        if (!response.ok) {
          throw new Error('Failed to fetch commands');
        }
        
        const text = await response.text();
        
        // Split by category headers
        const categoryBlocks = text.split(/(?=#)/);
        
        // Find the block for this category
        const categoryBlock = categoryBlocks.find(block => 
          block.trim().startsWith(`#${categoryName}`)
        );
        
        if (!categoryBlock) {
          throw new Error('Category not found');
        }
        
        // Parse the category block
        const lines = categoryBlock.split('\n').filter(line => line.trim());
        const name = lines[0].replace('#', '').trim();
        
        // Description is the line starting with -
        const descriptionLine = lines.find(line => line.trim().startsWith('-'));
        const description = descriptionLine ? descriptionLine.replace('-', '').trim() : '';
        
        // Commands are lines containing |
        const commands = lines
          .filter(line => line.includes('|'))
          .map(line => {
            const [name, description] = line.split('|').map(part => part.trim());
            // Replace \n with actual line breaks for rendering
            const formattedDescription = description.replace(/\\n/g, '\n');
            return { name, description: formattedDescription };
          });
        
        setCategoryData({ name, description, commands });
      } catch (err) {
        setError('명령어를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryName]);

  if (loading) {
    return <div className={styles.loading}></div>;
  }

  if (error || !categoryData) {
    return <div className={styles.error}>{error || '카테고리를 찾을 수 없습니다.'}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/commands" className={styles.backButton}>
        ❮ 뒤로 가기
        </Link>
        <h1 className={styles.title}>{categoryData.name}</h1>
      </div>
      
      <div className={styles.description}>{categoryData.description}</div>
      
      <div className={styles.commandsList}>
        {categoryData.commands.map((command, index) => (
          <div key={index} className={styles.commandCard}>
            <h3 className={styles.commandName}>{command.name}</h3>
            <div className={styles.commandDescription}>
              <ReactMarkdown>{command.description}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;