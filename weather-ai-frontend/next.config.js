/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/chatbot/:path*',
        destination: 'https://chatbot-rain-production.up.railway.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;