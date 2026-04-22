# Development

## Build outputs

- `npm run build` emits:
  - `lib/**` -> CommonJS runtime + `.d.ts`
  - `esm/**` -> ESM (`.mjs`)
- Config: `rslib.config.mjs`

## Useful scripts

- `npm run build` - clean + build CJS/ESM/types via Rslib
- `npm run build:inspect` - inspect resolved Rslib/Rspack config
- `npm run lint` - Biome check (lint + format + imports)
- `npm run lint:error` - same checks as `lint`, diagnostics at error level only (quieter logs; CI uses this)
- `npm run lint:fix` - Biome lint with auto-fix
- `npm test` - Jest (`ts-jest`)

## Node.js: published lib vs this repo

- **`engines.node`** (`>=16`): rough **consumer** floor for running published `lib/**/*.js` / `esm/**/*.mjs`. Current emit uses class fields, spread, and destructuring (no `??` / `?.` in output); Node 14 could load similar syntax but is EOL, so **16** is the documented minimum.
- **`devEngines`**: **contributors / CI only** — Node and npm versions needed to install devDependencies and run Rslib/Biome/Jest. Matches `@rslib/core` / `@rsbuild/core` (`^20.19.0 || >=22.12.0`). Enforced by npm on `install` / `ci` / `run` when using a npm version that supports `devEngines` (npm 10+); older npm ignores the field.

## Package entrypoints

`package.json` publishes dual mode:

- `main`: `lib/index.js`
- `module`: `esm/index.mjs`
- `types`: `lib/index.d.ts`
- `exports`:
  - `.` with `import` / `require` / `types`
  - `./lib/*` and `./esm/*` subpaths

## Pre-release checklist

1. `npm ci` (or clean `npm install`)
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. Optional: `npm pack --dry-run` and confirm tarball includes `lib/**` + `esm/**` and excludes source/test internals
6. Optional consumer verification with `yalc` (`yalc publish` then update consumer and run its tests/build)

## Publish

- Bump/tag release (`npm run tag-release` or manual)
- Publish from clean tree after successful build/test

## Rollback

If release regression appears:

1. Revert offending commit(s)
2. Publish patch with corrected entrypoint/output metadata
3. Ask consumers to repin/update
