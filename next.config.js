const webpack = require('webpack');

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
    config.plugins.push(
      new webpack.ProvidePlugin({
        'regeneratorRuntime': 'regenerator-runtime',
      })
    );
    return config;
  },
  cssModules: true,
};

module.exports = nextConfig;