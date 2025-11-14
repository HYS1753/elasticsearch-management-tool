/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/es/:path*',
        destination: `${process.env.ELASTICSEARCH_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
