//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

// Load .env from project root
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdn.digitaloceanspaces.com',
      },
    ],
  },
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_BASE_API_URL || 'http://localhost:3001/api/v1'}/:path*`,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
