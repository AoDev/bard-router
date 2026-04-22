# Bard mobx router

[![npm version](https://badge.fury.io/js/bard-router.svg)](https://badge.fury.io/js/bard-router)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/github/AoDev/bard-router/badge.svg)](https://snyk.io/test/github/AoDev/bard-router)

**More than just a routing solution, for React/Mobx applications**.

## Features summary

- Router with a `very simple API`, and `navigation hooks`.
- React components `<Link/>` and `<Route/>` that observe the router state and react accordingly.
- A collection of plugins to make your life easier (history, window title, scroll, vms).

## The name

> In medieval Gaelic and British culture, a **"bard"** was a story teller. They would talk about the people's journey in the world. A user interacting with an aplication is like a journey that the router allows to take, tell and remember.

## Install

```
npm install bard-router -DE
```

## Build (Rslib)

Library ships as **dual CJS + ESM** plus TypeScript declarations (see `package.json` `main` / `module` / `types` / `exports`).

- **Build:** `npm run build` → `lib/` (CJS + `.d.ts`, same paths as before for root + deep imports), `esm/` (ESM `.mjs`)
- **Inspect config:** `npm run build:inspect`

Development guide: [DEVELOPMENT.md](DEVELOPMENT.md).

## Check the docs :)

[Full documentation site](https://bard-mobx-router.netlify.com)
