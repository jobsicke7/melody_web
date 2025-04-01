import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import fetch from 'node-fetch';

// Discord bot API endpoint
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const BOT_API_SECRET = process.env.BOT_API_SECRET || 'your_secret_key';

// Helper function for bot API requests
async function callBotApi(endpoint: string, method: string, body: any) {
  try {
    const response = await fetch(`${BOT_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_API_SECRET}`,
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bot API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Bot API call failed:', error);
    throw error;
  }
}

// GET handler - fetch now playing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get('guildId');

  if (!guildId) {
    return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await callBotApi('/music/now-playing', 'POST', { guildId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 });
  }
}

// POST handler - play music or resume
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guildId, url } = body;

    if (!guildId) {
      return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 });
    }

    if (url) {
      // Add song to queue
      await callBotApi('/music/play', 'POST', {
        guildId,
        url,
        userId: session.user.id,
        userName: session.user.name,
      });

      return NextResponse.json({ success: true, message: 'Song added to queue' });
    }

    // Resume playback
    await callBotApi('/music/play', 'POST', { guildId });
    return NextResponse.json({ success: true, message: 'Playback resumed' });
  } catch (error) {
    console.error('Play error:', error);
    return NextResponse.json({ error: 'Failed to play music' }, { status: 500 });
  }
}