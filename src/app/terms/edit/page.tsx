// app/terms/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocEditor from '@/components/DocEditor';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function TermsEditPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session } = useSession();
    
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    useEffect(() => {
        // 문서 내용 가져오기
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/docs?type=terms');
                const data = await response.json();
                setContent(data.content || '');
            } catch (error) {
                console.error('Failed to fetch document:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, []);


    const handleSave = async (newContent: string) => {
        try {
            const response = await fetch('/api/docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'terms',
                    content: newContent,
                    password: 'jslove0619qq@@', // 저장할 때도 비밀번호 검증
                }),
            });
            router.push('/terms');
            if (!response.ok) {
                throw new Error('Failed to save document');
            }
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    };

    if (isLoading) {
        return <div></div>;
    }
    return (
        <main>
            <DocEditor
                initialContent={content}
                docType="terms"
                onSave={handleSave}
            />
        </main>
    );
}
