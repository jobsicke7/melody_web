// src/components/DocEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../styles/DocEditor.module.css';

// EditorJS 타입 정의 (간소화된 버전)
interface EditorJSInstance {
    isReady: Promise<void>;
    save: () => Promise<any>;
    destroy?: () => void; // destroy가 선택적 속성이 되도록 수정
}

interface DocEditorProps {
    initialContent: string;
    docType: 'privacy' | 'terms';
    onSave: (content: string) => Promise<void>;
}

export default function DocEditor({ initialContent, docType, onSave }: DocEditorProps) {
    const editorRef = useRef<EditorJSInstance | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // 서버 사이드 렌더링 시 실행 방지
        if (typeof window === 'undefined' || !editorContainerRef.current) return;

        // 에디터가 이미 초기화되어 있는지 확인
        if (editorRef.current && editorRef.current.destroy) {
            try {
                editorRef.current.destroy();
            } catch (e) {
                console.warn("Failed to destroy editor instance:", e);
            }
        }

        let isComponentMounted = true;

        // Editor.js 관련 모듈 동적 로드
        const initEditor = async () => {
            try {
                // 필요한 모듈 동적 로드
                const EditorJS = (await import('@editorjs/editorjs')).default;
                const Header = (await import('@editorjs/header')).default;
                const List = (await import('@editorjs/list')).default;
                const Checklist = (await import('@editorjs/checklist')).default;
                const Quote = (await import('@editorjs/quote')).default;
                const Delimiter = (await import('@editorjs/delimiter')).default;
                const Marker = (await import('@editorjs/marker')).default;
                const Paragraph = (await import('@editorjs/paragraph')).default;

                // 컴포넌트가 언마운트 되었는지 확인
                if (!isComponentMounted) return;

                // JSON 파싱 시도 (JSON 형식이 아니면 텍스트로 처리)
                let parsedContent;
                try {
                    parsedContent = initialContent ? JSON.parse(initialContent) : {};
                } catch (e) {
                    // JSON이 아니면 텍스트로 처리
                    parsedContent = {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: {
                                    text: initialContent || ''
                                }
                            }
                        ]
                    };
                }

                // 새 에디터 인스턴스 생성
                const editor = new EditorJS({
                    holder: editorContainerRef.current,
                    tools: {
                        header: Header,
                        list: List,
                        checklist: Checklist,
                        quote: Quote,
                        delimiter: Delimiter,
                        marker: Marker,
                        paragraph: Paragraph
                    },
                    data: parsedContent,
                    placeholder: '내용을 입력하세요...',
                    onChange: () => {
                        // onChange 로직 추가
                    }
                });

                // 에디터가 준비될 때까지 기다림
                await editor.isReady;

                // 컴포넌트가 마운트 상태일 때만 상태 업데이트
                if (isComponentMounted) {
                    editorRef.current = editor;
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error('Editor initialization error:', error);
            }
        };

        initEditor();

        // 컴포넌트 언마운트 시 에디터 인스턴스 제거
        return () => {
            isComponentMounted = false;
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    editorRef.current.destroy();
                } catch (e) {
                    console.warn("Error destroying editor:", e);
                }
            }
        };
    }, [initialContent]);

    const handleSave = async () => {
        if (!editorRef.current) return;

        setIsSaving(true);
        try {
            const savedData = await editorRef.current.save();
            await onSave(JSON.stringify(savedData));
            alert('저장되었습니다.');
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                <h1>{docType === 'privacy' ? '개인정보처리방침' : '이용약관'} 편집</h1>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving || !isLoaded}
                >
                    {isSaving ? '저장 중...' : '저장'}
                </button>
            </div>
            <div
                ref={editorContainerRef}
                className={styles.editor}
            ></div>

            {/* 에디터 로딩 중 표시 */}
            {!isLoaded && <div className={styles.loading}>에디터 로딩 중...</div>}
        </div>
    );
}
