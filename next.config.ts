/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/icons/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      // Add these new patterns
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi_webp/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**", // This will allow any path on i.ytimg.com
      }
    ],
  },
};

module.exports = nextConfig;
