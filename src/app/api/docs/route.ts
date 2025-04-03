import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

// GET 요청 처리 (문서 가져오기)
export async function GET(request: NextRequest) {
    const type = request.nextUrl.searchParams.get('type');

    if (!type || !['privacy', 'terms'].includes(type)) {
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // MongoDB에서 문서 가져오기
        const doc = await db.collection('docs').findOne({ type });

        console.log(`GET request for ${type} document:`, doc ? 'Found' : 'Not found');

        if (!doc) {
            return NextResponse.json({ content: '' }, { status: 200 });
        }

        return NextResponse.json(doc);
    } catch (error) {
        console.error('Failed to fetch document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}

// POST 요청 처리 (문서 저장하기)
export async function POST(request: NextRequest) {
    try {
        const { type, content, password } = await request.json();

        // 필수 필드 체크
        if (!type || !content || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 간단한 비밀번호 체크 (실제로는 더 안전한 방법 사용)
        const correctPassword = process.env.ADMIN_PASSWORD || 'jslove0619qq@@';
        if (password !== correctPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // upsert: true로 설정하여 문서가 없으면 새로 생성
        const result = await db.collection('docs').updateOne(
            { type },
            { $set: { content, updatedAt: new Date() } },
            { upsert: true }
        );

        console.log(`Document ${type} ${result.upsertedCount ? 'created' : 'updated'}`);

        return NextResponse.json({
            success: true,
            message: `${type === 'privacy' ? '개인정보처리방침' : '이용약관'}이 저장되었습니다.`
        });
    } catch (error) {
        console.error('Failed to save document:', error);
        return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }
}
