import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: { guildid: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guildId = context.params.guildid;
    const apiUrl = `https://discord.com/api/v10/guilds/${guildId}`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch guild info" }, { status: response.status });
        }

        const guildData = await response.json();
        return NextResponse.json(guildData);
        
    } catch (error) {
        console.error("Error fetching guild info:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}