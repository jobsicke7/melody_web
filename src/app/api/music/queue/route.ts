import { NextResponse } from 'next/server';
import { clientPromise } from '../../../lib/mongodb';
import { Long } from 'mongodb'; // ✅ Int64 변환을 위해 추가

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const guildIdStr = url.searchParams.get('guildId');

    if (!guildIdStr) {
      return NextResponse.json({ error: 'Missing guildId' }, { status: 400 });
    }

    const guildId = Long.fromString(guildIdStr); // ✅ Int64 변환

    const client = await clientPromise;
    const db = client.db('discord_music_bot');

    const queue = await db.collection('music_queue')
      .find({ guild_id: guildId }) // ✅ Int64 타입 맞춤
      .sort({ _id: 1 })
      .toArray();

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}