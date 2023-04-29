/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  font-src 'self';  
`

//child-src example.com;

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { 
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  { key: 'X-XSS-Protection', value: '1, mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // DENY|SAMEORIGIN
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  //{
  //  key: 'Content-Security-Policy',
  //  value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  //},
  //{
  //  key: 'Permissions-Policy',
  //  value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  //}
]

const nextConfig = {
  //assetPrefix: isProd ? '/ts-next-blog' : '',
  basePath: '',
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  }
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
