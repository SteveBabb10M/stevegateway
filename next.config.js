/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable edge runtime for API routes if needed
  experimental: {
    serverComponentsExternalPackages: ['mammoth']
  }
};

module.exports = nextConfig;
