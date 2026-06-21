/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large file uploads (video/audio can be 50-100MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '150mb',
    },
  },
  // CORS headers for the Vite dev server
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
