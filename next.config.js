/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  //assetPrefix: isProd ? '/ts-next-blog' : '',
  //basePath: '/ts-next-blog',
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  //webpack: (config, options) => {
  //  if (!options.dev && !options.isServer) {
  //    Object.assign(config.resolve.alias, {
  //      'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
  //      react: 'preact/compat',
  //      'react-dom/test-utils': 'preact/test-utils',
  //      'react-dom': 'preact/compat'
  //    })
  //  }
  //  return config
  //},
}

module.exports = nextConfig
