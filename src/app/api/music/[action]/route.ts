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
  console.error('API Error:', error); // Fixed typo: console.er ror -> console.error
  return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
};

// Now Playing (GET)
export async function GET(
  req: NextRequest, 
  { params }: { params: { action: string } }
) {
  const { action } = params;
  const guildId = req.nextUrl.searchParams.get('guildId');
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token || token !== BOT_API_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'now-playing') {
    try {
      const response = await fetch(`${API_BASE_URL}/music/now-playing?guildId=${guildId}`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  }

  if (action === 'queue') {
    try {
      const response = await fetch(`${API_BASE_URL}/music/queue?guildId=${guildId}`, {
        headers: getHeaders(token),
      });
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
}

export async function POST(
  req: NextRequest, 
  { params }: { params: { action: string } }
) {
  const { action } = params;
  console.log('headers:', req.headers);
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  console.log('token:', token);

  if (!token || token !== BOT_API_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'pause') {
    try {
      const body = await req.json();
      const { guildId } = body;
  
      // 필수 필드 검증
      if (!guildId) {
        return NextResponse.json(
          { success: false, message: 'guildId is required' },
          { status: 400 }
        );
      }
  
      const response = await fetch(`${API_BASE_URL}/music/pause`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ guildId }),
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  }

  if (action === 'play') {
    try {
      const body = await req.json();
      const { guildId, url, userId, userName } = body;
  
      // 필수 필드 확인
      if (!guildId) {
        return NextResponse.json(
          { success: false, message: 'guildId is required' },
          { status: 400 }
        );
      }
  
      const response = await fetch(`${API_BASE_URL}/music/play`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          guildId,
          url,
          userId,
          userName,
        }),
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
}