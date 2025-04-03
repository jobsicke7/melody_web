// app/components/DocViewer.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/DocViewer.module.css';

interface DocViewerProps {
    content: string;
    title: string;
    docType?: 'privacy' | 'terms'; // 문서 타입 추가
}

export default function DocViewer({ content, title, docType}: DocViewerProps) {
    const [parsedContent, setParsedContent] = useState<any>(null);
    const [clickCount, setClickCount] = useState(0);
    const clickTimer = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!content) {
            setParsedContent(null);
            return;
        }

        try {
            const data = JSON.parse(content);

            // 데이터 구조 변환
            const transformedBlocks = data.blocks.map((block: any) => {
                if (block.link) {
                    return {
                        type: 'link',
                        data: {
                            link: block.link,
                            meta: block.meta || {}
                        }
                    };
                }
                return block;
            });

            setParsedContent({ ...data, blocks: transformedBlocks });
        } catch (e) {
            // 일반 텍스트로 취급
            setParsedContent({
                blocks: [
                    {
                        type: 'paragraph',
                        data: {
                            text: content
                        }
                    }
                ]
            });
        }
    }, [content]);

    // 연속 클릭을 위한 핸들러
    const handleTitleClick = () => {
        // 현재 클릭 카운트 증가
        const newCount = clickCount + 1;
        setClickCount(newCount);
        
        // 이전 타이머가 있으면 취소
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
        }
        
        // 5번 클릭했으면 편집 페이지로 이동
        if (newCount === 5) {
            router.push(`/${docType}/edit`);
            setClickCount(0);
            return;
        }

        // 1.5초 후에 클릭 카운트 리셋하는 타이머
        clickTimer.current = setTimeout(() => {
            setClickCount(0);
        }, 1500);
    };

    // 리스트 항목을 렌더링하기 위한 유틸리티 함수
    const renderListItem = (item: any) => {
        // 문자열인 경우 그대로 반환
        if (typeof item === 'string') {
            return item;
        }
        
        // 객체이고 text 속성이 있는 경우
        if (item && typeof item === 'object') {
            if (item.text) return item.text;
            if (item.content) return item.content;
            
            // 다른 가능한 속성 시도
            for (const key in item) {
                if (typeof item[key] === 'string') {
                    return item[key];
                }
            }
        }
        
        // 그 외의 경우 JSON 문자열로 변환하되 "[object Object]" 방지
        return JSON.stringify(item);
    };

    if (!parsedContent) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title} onClick={handleTitleClick}>{title}</h1>
                <p className={styles.empty}>내용이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title} onClick={handleTitleClick}>{title}</h1>
            <div className={styles.content}>
                {parsedContent.blocks?.map((block: any, index: number) => {
                    switch (block.type) {
                        case 'header':
                            const level = block.data.level || 2;
                            return level === 1 ? (
                                <h1 key={index} className={styles.header}>{block.data.text}</h1>
                            ) : level === 2 ? (
                                <h2 key={index} className={styles.header}>{block.data.text}</h2>
                            ) : level === 3 ? (
                                <h3 key={index} className={styles.header}>{block.data.text}</h3>
                            ) : level === 4 ? (
                                <h4 key={index} className={styles.header}>{block.data.text}</h4>
                            ) : level === 5 ? (
                                <h5 key={index} className={styles.header}>{block.data.text}</h5>
                            ) : (
                                <h6 key={index} className={styles.header}>{block.data.text}</h6>
                            );

                        case 'paragraph':
                            return <p key={index} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: block.data.text }}></p>;
                        case 'link':
                            return (
                                <div key={index} className={styles.linkButtonContainer}>
                                    <a href={block.data.link} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                                        {block.data.meta?.title || '링크 열기'}
                                    </a>
                                    {block.data.meta?.description && (
                                        <p className={styles.linkDescription}>{block.data.meta.description}</p>
                                    )}
                                </div>
                            );
                        case 'list':
                            if (block.data.style === 'ordered') {
                                return (
                                    <ol key={index} className={styles.list}>
                                        {block.data.items.map((item: any, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: renderListItem(item) }}></li>
                                        ))}
                                    </ol>
                                );
                            } else {
                                return (
                                    <ul key={index} className={styles.list}>
                                        {block.data.items.map((item: any, i: number) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: renderListItem(item) }}></li>
                                        ))}
                                    </ul>
                                );
                            }

                        case 'checklist':
                            return (
                                <div key={index} className={styles.checklist}>
                                    {block.data.items.map((item: any, i: number) => (
                                        <div key={i} className={styles.checklistItem}>
                                            <input type="checkbox" checked={item.checked} readOnly className={styles.checkbox} />
                                            <span dangerouslySetInnerHTML={{ __html: typeof item.text === 'string' ? item.text : renderListItem(item) }}></span>
                                        </div>
                                    ))}
                                </div>
                            );

                        case 'quote':
                            return (
                                <blockquote key={index} className={styles.quote}>
                                    <p dangerouslySetInnerHTML={{ __html: block.data.text }}></p>
                                    {block.data.caption && <cite>{block.data.caption}</cite>}
                                </blockquote>
                            );

                        case 'delimiter':
                            return <hr key={index} className={styles.delimiter} />;
                        case 'image':
                            return (
                                <div key={index} className={styles.image}>
                                    <img src={block.data.file.url} alt={block.data.caption} />
                                    {block.data.caption && <caption>{block.data.caption}</caption>}
                                </div>
                            );
                        
                        case 'table':
                            return (
                                <div key={index} className={styles.table}>
                                    <table>
                                        <tbody>
                                            {block.data.content.map((row: string[], i: number) => (
                                                <tr key={i}>
                                                    {row.map((cell: string, j: number) => (
                                                        <td key={j} dangerouslySetInnerHTML={{ __html: cell }}></td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        
                        case 'code':
                            return (
                                <pre key={index} className={styles.code}>
                                    <code>{block.data.code}</code>
                                </pre>
                            );
                        
                        case 'embed':
                            return (
                                <div key={index} className={styles.embed}>
                                    <iframe
                                        src={block.data.embed}
                                        width={block.data.width}
                                        height={block.data.height}
                                        frameBorder="0"
                                        allowFullScreen
                                    />
                                    {block.data.caption && <p>{block.data.caption}</p>}
                                </div>
                            );
                        
                        case 'warning':
                            return (
                                <div key={index} className={styles.warning}>
                                    <h3>{block.data.title}</h3>
                                    <p>{block.data.message}</p>
                                </div>
                            );
                        
                        case 'raw':
                            return (
                                <div key={index} className={styles.raw}>
                                    <pre>{block.data.html}</pre>
                                </div>
                            );
                        default:
                            return <div key={index}>{JSON.stringify(block.data)}</div>;
                    }
                })}
            </div>
        </div>
    );
}
