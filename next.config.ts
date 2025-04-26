import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { dev }) {
    if (dev) {
      // Avoid setting devtool explicitly in development
      config.devtool = false; // Or let Next.js handle it
    }
    return config;
  },
};

export default nextConfig;
