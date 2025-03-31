import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`);
    
    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json([], { status: 200 });
    }

    const results = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}