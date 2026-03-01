import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'
import { nitro } from 'nitro/vite'

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
  ],
})
