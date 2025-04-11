/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: { unoptimized: true, domains: ["localhost", "ligaye.com"] },
};

module.exports = nextConfig;
