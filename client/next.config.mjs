/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SCSS support
  sassOptions: {
    includePaths: ['./src'],
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Unity WebGL and WASM files are handled automatically
  },
  // Allow external images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  // Allow cross-origin requests from local network IP
  allowedDevOrigins: [
    '10.74.209.237',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
