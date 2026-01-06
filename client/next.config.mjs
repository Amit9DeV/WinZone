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
};

export default nextConfig;
