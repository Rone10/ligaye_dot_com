/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: { unoptimized: true, domains: ["localhost", "ligaye.com"] },
  async headers() {
    return [
      {
        // Cache location data files aggressively since they rarely change
        source: "/data/locations/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year
          },
        ],
      },
      {
        // Cache sitemap to reduce database queries from bot crawling
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400", // 1 hour cache, 24h stale
          },
        ],
      },
      {
        // Cache robots.txt
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400", // 24 hours
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
