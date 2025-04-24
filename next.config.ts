import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
    domains: ['images.unsplash.com', 'rzezoxuqhavwwvwfozip.supabase.co'],
  },
};

export default nextConfig;
