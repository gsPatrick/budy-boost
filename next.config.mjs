/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'geral-shopifyapi.r954jc.easypanel.host',
      },
    ],
  },
};

export default nextConfig;
