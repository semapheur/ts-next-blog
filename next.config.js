/** @type {import('next').NextConfig} */
const nextConfig = {
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
