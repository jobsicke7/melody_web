import axios from 'axios';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let url = searchParams.get('url');

        if (!url) {
            return new Response(
                JSON.stringify({ success: false, message: 'URL is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // URL에 프로토콜이 없으면 추가
        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        // URL의 HTML 데이터를 가져옴
        const response = await axios.get(url);
        const html = response.data;

        // HTML에서 메타데이터를 파싱
        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
        const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] || 'No description';
        const image = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || '';

        // 메타데이터를 반환
        return new Response(
            JSON.stringify({
                success: true,
                meta: {
                    title,
                    description,
                    image: { url: image },
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to fetch metadata' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req) {
    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(
                JSON.stringify({ success: false, message: 'URL is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // URL의 HTML 데이터를 가져옴
        const response = await axios.get(url);
        const html = response.data;

        // HTML에서 메타데이터를 파싱
        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title';
        const description = html.match(/<meta name="description" content="(.*?)"/)?.[1] || 'No description';
        const image = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || '';

        // 메타데이터를 반환
        return new Response(
            JSON.stringify({
                success: true,
                meta: {
                    title,
                    description,
                    image: { url: image },
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to fetch metadata' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}