import { NextRequest, NextResponse } from 'next/server';

// 환경 변수
const BOT_API_SECRET = process.env.BOT_API_SECRET || 'your_secret_key';
const API_BASE_URL = process.env.BOT_API_URL || 'http://localhost:3001';

// 공통 헤더 설정
const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// 공통 에러 핸들링
const handleError = (error: any) => {
  console.error('API Error:', error);
  return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
};

// Now Playing (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;
    const guildId = req.nextUrl.searchParams.get('guildId');
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');

    // 유효성 검사
    if (!token || !guildId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // API 요청
    const response = await fetch(`${API_BASE_URL}/music/${action}?guildId=${guildId}`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return handleError(error);
  }
}