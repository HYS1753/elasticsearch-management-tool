/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  output: 'standalone',

  reactStrictMode: false,
};

module.exports = nextConfig;