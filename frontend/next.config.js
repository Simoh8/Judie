/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT__BACKEND_URL: process.env.NEXT__BACKEND_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT__BACKEND_URL || 'http://localhost:8000'}/media/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;




