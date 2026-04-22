import {defineConfig} from '@rslib/core'
import {pluginReact} from '@rsbuild/plugin-react'

/**
 * Production build: bundleless CJS + ESM + declarations (CJS tree).
 * CJS stays under `lib/` (same layout as pre–Rslib Babel publish) for deep-import compatibility.
 * ESM under `esm/` (`.mjs`).
 */
export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
      },
    }),
  ],
  lib: [
    {
      format: 'cjs',
      bundle: false,
      syntax: ['> 5%'],
      dts: true,
      output: {
        distPath: {
          root: 'lib',
        },
        target: 'web',
      },
    },
    {
      format: 'esm',
      bundle: false,
      syntax: ['> 5%'],
      dts: false,
      output: {
        distPath: {
          root: 'esm',
        },
        target: 'web',
      },
    },
  ],
  source: {
    tsconfigPath: './tsconfig.build.json',
    entry: {
      index: ['./src/**/*.ts', './src/**/*.tsx', '!src/**/*.md'],
    },
  },
})
