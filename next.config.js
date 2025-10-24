/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/backadmin',
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Desabilitar telemetria em produção
  telemetry: {
    disabled: true,
  },
}

module.exports = nextConfig