// app/privacy/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocEditor from '@/components/DocEditor';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PrivacyEditPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const { data: session } = useSession();
    const [content, setContent] = useState<string>(''); // The content fetched from API
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Authentication state
    const router = useRouter();
    useEffect(() => {
        // Fetch document content
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/docs?type=privacy');

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
    }, []); // This effect runs only once when the component is mounted

    // const handleVerifyPassword = async (password: string) => {
    //     if (password === 'jslove0619qq@@') {
    //         setIsAuthenticated(true);
    //         return true;
    //     }
    //     return false;
    // };

    const handleSave = async (newContent: string) => {
        try {
            const response = await fetch('/api/docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'privacy',
                    content: newContent,
                    password: 'jslove0619qq@@', // Password for saving document
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save document');
            }

            router.push('/privacy'); // Redirect after successful save
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <div></div>; // Optional: Add a loading spinner or message
    }
    // if (!isAuthenticated) {
    //     return <PasswordModal onVerify={handleVerifyPassword} />;
    // }

    return (
        <main>
            <DocEditor
                initialContent={content}
                docType="privacy"
                onSave={handleSave}
            />
        </main>
    );
}
