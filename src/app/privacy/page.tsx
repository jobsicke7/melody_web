import { clientPromise } from '@/lib/mongodb';
import DocViewer from '@/components/DocViewer';
import { Metadata } from 'next';

// 항상 동적으로 실행되도록 설정
export const dynamic = 'force-dynamic';
// 캐싱 비활성화
export const revalidate = 0;

export const metadata: Metadata = {
    title: '개인정보처리방침',
    description: '사이트의 개인정보처리방침을 확인하세요',
};

export default async function PrivacyPage() {
    
    let content = '';

    try {
        // 직접 MongoDB 연결
        const client = await clientPromise;
        const db = client.db();

        // MongoDB에서 최신 문서 가져오기
        const doc = await db.collection('docs').findOne({ type: 'privacy' });

        // 문서가 존재하면 내용 가져오기
        if (doc && doc.content) {
            content = doc.content;
            console.log('Successfully fetched privacy policy from MongoDB');
        } else {
            console.log('Privacy policy document not found in MongoDB');
        }
    } catch (error) {
        console.error('Error fetching privacy policy from MongoDB:', error);
    }

    return <DocViewer content={content} title="개인정보처리방침" docType='privacy'/>;
}
