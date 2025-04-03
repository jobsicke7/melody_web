'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocEditor from '@/components/DocEditor';
import { useSession } from 'next-auth/react';

export default function PrivacyEditPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session } = useSession();
    const [content, setContent] = useState<string>(''); // The content fetched from API
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
    const router = useRouter();

    useEffect(() => {
        // Check if the user is authenticated and has the correct email
        if (session?.user?.email !== 'jobsicke282@gmail.com') {
            router.back(); // Redirect to the previous page
            return;
        }

        // Fetch document content
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/docs?type=terms');

                if (!response.ok) {
                    throw new Error(`Failed to fetch document. Status: ${response.status}`);
                }

                const data = await response.json();

                // Handle empty or malformed content from the server
                if (data?.content) {
                    setContent(data.content);
                } else {
                    setContent(''); // If no content is found, set to empty string
                }
            } catch (error) {
                console.error('Failed to fetch document:', error);
                setContent(''); // Set content to empty in case of error
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [session, router]); // This effect runs when session or router changes

    const handleSave = async (updatedContent: string) => {
        try {
            const response = await fetch('/api/docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'terms', // 문서 타입
                    content: updatedContent, // 업데이트된 내용
                    password: 'jslove0619qq@@', // 서버에서 요구하는 비밀번호
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save document. Status: ${response.status}, Error: ${errorData.error}`);
            }
    
            router.push('/terms');
        } catch (error) {
            console.error('Failed to save document:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <DocEditor
                initialContent={content}
                docType="terms"
                onSave={handleSave}
            />
        </div>
    );
}