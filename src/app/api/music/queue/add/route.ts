import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '../../../../../lib/mongodb';
import { Long } from 'mongodb'; // ✅ Int64 변환을 위해 추가

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { guild_id, url, title, user_name, user_id } = data;

    if (!guild_id || !url || !title || !user_name || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const guildId = Long.fromString(guild_id); // ✅ Int64 변환

    const client = await clientPromise;
    const db = client.db('discord_music_bot');

    await db.collection('music_queue').insertOne({
      guild_id: guildId, // ✅ Int64로 저장
      title,
      url,
      user_name,
      user_id,
      added_at: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
  }
}
