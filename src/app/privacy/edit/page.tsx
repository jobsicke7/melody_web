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
    }, [session, router]); // This effect runs when session or router changes

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <DocEditor content={content} />
        </div>
    );
}