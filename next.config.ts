import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '*',
        pathname: '**',
      },
    ],
    domains: ['images.unsplash.com', 'rzezoxuqhavwwvwfozip.supabase.co'],
    unoptimized: true,
  },
};

export default nextConfig;
