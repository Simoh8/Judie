/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT__BACKEND_URL: process.env.NEXT__BACKEND_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;




