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
    ];
  },
};

module.exports = nextConfig;
