import { NextResponse } from 'next/server';
import { clientPromise } from '../../../lib/mongodb';
import { Long } from 'mongodb'; // 🔥 Long 추가

export async function GET(req: Request) {
  const url = new URL(req.url);
  const guildIdStr = url.searchParams.get('guildId');

  if (!guildIdStr) {
    return NextResponse.json({ error: 'Invalid or missing guildId' }, { status: 400 });
  }

  const guildId = Long.fromString(guildIdStr); 


  try {
    const client = await clientPromise;
    const db = client.db('discord_music_bot');

    // 🔥 Int64 타입 맞춰서 조회
    const nowPlaying = await db.collection('now_playing').findOne({ guild_id: guildId });


    return NextResponse.json(nowPlaying || { message: 'No data found' });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}