import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'
import terser from '@rollup/plugin-terser'
import fs from 'fs/promises'

const packages = [
  'hooks',
  'shared',
  'services',
].map((v) => `@gabriel9x9/${v}`)

const name = '@gabriel9x9/' + (process.env.NAME || '')

const dir = process.env.DIR || './src/'

const libs = [
  'antd',
  'react',
  'react-dom',
  'lodash-es',
  '@tarojs/components',
  '@tarojs/helper',
  '@tarojs/taro',
  '@tarojs/shared',
  '@tarojs/react',
  '@antmjs/vantui',
  '@tarojs/runtime',
  'dayjs'
]

const tsconfigPath = resolve(__dirname, './tsconfig.json')

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'
    }),
    dts({
      outDir: 'dist/@types',
      include: [dir + '**/*.ts', dir + '**/*.tsx', dir + '**/*.d.ts'],
      tsconfigPath: tsconfigPath,
      async afterBuild(emittedFiles) {
        const keys = Array.from(emittedFiles.keys())
        let idx = 0
        do {
          const key = keys[idx]
          await fs.writeFile(
            key,
            emittedFiles.get(key)?.replace(/import\("packages\//g, 'import("@ysx-use/') || ''
          )
          idx++
        } while (idx < keys.length)
      }
    }),
    terser({
      format: {
        comments: 'all'
      }
    }) as any
  ],
  build: {
    rollupOptions: {
      external: [...libs, ...packages],
      output: {
        interop: 'auto',
        preserveModules: true,
        exports: 'named'
      }
    },
    lib: {
      entry: dir + 'index.ts',
      name: name,
      fileName: (format, entryName) => {
        const fileName = `${format === 'es' ? 'es' : 'lib'}/${entryName
          .split('/')
          .slice(0)
          .join('/')}.${format === 'es' ? 'mjs' : 'cjs'}`
        return fileName
      },
      formats: ['es', 'cjs']
    }
  }
})
