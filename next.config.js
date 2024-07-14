/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
      };
    }
    return config;
  },
  babel: {
    presets: ['next/babel'],
    plugins: [['@babel/plugin-transform-runtime', { regenerator: true }]],
  },
};

module.exports = nextConfig;