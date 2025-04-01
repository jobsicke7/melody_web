import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import fetch from 'node-fetch';

// Discord bot API endpoint
const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';
const BOT_API_SECRET = process.env.BOT_API_SECRET || 'your_secret_key';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guildId } = body;

    if (!guildId) {
      return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 });
    }

    const response = await fetch(`${BOT_API_URL}/music/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_API_SECRET}`
      },
      body: JSON.stringify({ guildId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bot API error (${response.status}): ${errorText}`);
    }

    return NextResponse.json({ success: true, message: 'Skip command executed' });
  } catch (error) {
    console.error('Skip error:', error);
    return NextResponse.json({ error: 'Failed to skip' }, { status: 500 });
  }
}