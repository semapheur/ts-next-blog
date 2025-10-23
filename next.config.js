/** @type {import('next').NextConfig} */
const million = require('million/compiler')
const { default: next } = require('next')

const isProd = process.env.NODE_ENV === 'production'

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
  style-src 'self';
  font-src 'self';  
`

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
  staticPageGenerationTimeout: 1000,
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.fs': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vs': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
}

const millionConfig = {
  auto: {
    threshold: 0.05, // default: 0.1,
    skip: ['useBadHook', /badVariable/g],
    rsc: true
  }
}

module.exports = million.next(nextConfig)