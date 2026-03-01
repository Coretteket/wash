import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  optimizeDeps: { exclude: ['playwright', 'playwright-core'] },
  ssr: { external: ['playwright', 'playwright-core'] },
  plugins: [
    devtools(),
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    nitro({ preset: 'node-server' }),
    tanstackStart({
      spa: { enabled: true },
      router: { generatedRouteTree: './routes.gen.ts' },
    }),
    solidPlugin({ ssr: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'duwo.png'],
      outDir: '.output/public',
      manifest: {
        name: 'DUWash',
        short_name: 'DUWash',
        description: 'Washing machine booking & status',
        start_url: '/',
        display: 'standalone',
        theme_color: '#171717',
        background_color: '#171717',
        icons: [
          {
            src: 'duwo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globDirectory: '.output/public',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
})
