/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  assetPrefix: isProd ? '/ts-next-blog' : '',
  basePath: '/ts-next-blog',
  experimental: {
    appDir: true,
  },
  //webpack: (config, options) => {
  //  if (options.isServer) {
  //    return {
  //      ...config,
  //      entry() {
  //        return config.entry().then(entry => {
  //          return Object.assign({}, entry, {
  //            cache: './scripts/cache.ts'
  //          })
  //        })
  //      }
  //    }
  //  }
  //  return config;
  //},
}

module.exports = nextConfig
