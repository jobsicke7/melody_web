export async function fetchDiscordGuilds(token: string) {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch guilds");
  return await res.json();
}
