import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ guildid: string }> }
) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      console.log('인증 실패: 액세스 토큰 없음');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 길드 ID 가져오기
    const { guildid } = await context.params;
    console.log('길드 ID:', guildid);

    // 3. 사용자의 길드 정보 먼저 조회
    const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      }
    });

    
    if (!guildsResponse.ok) {
      const errorText = await guildsResponse.text();
      console.log('길드 조회 에러:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch guilds' }, 
        { status: guildsResponse.status }
      );
    }

    const guilds = await guildsResponse.json();
    interface DiscordGuild {
      id: string;
      owner: boolean;
      permissions: number;
    }

    const targetGuild = guilds.find((g: DiscordGuild) => g.id === guildid);

    if (!targetGuild) {
      return NextResponse.json(
        { error: 'Guild not found or no access' }, 
        { status: 404 }
      );
    }

 
    let role = 'MEMBER';
    if (targetGuild.owner) {
      role = 'OWNER';
    } else if ((BigInt(targetGuild.permissions) & BigInt(0x8)) === BigInt(0x8)) {
      role = 'ADMIN';
    }
    

    return NextResponse.json({ role });

  } catch (error) {
    console.error('에러 발생:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}