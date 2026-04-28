# Bard mobx router

[![npm version](https://badge.fury.io/js/bard-router.svg)](https://badge.fury.io/js/bard-router)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**Type-safe React + MobX router with simple navigation APIs, hooks, and extensible plugins.**

## Features summary

- Router with a simple API and navigation hooks.
- React components `<Link/>` and `<Route/>` that observe the router state and react accordingly.
- A collection of plugins to make your life easier (history, window title, scroll).

## The name

> In medieval Gaelic and British culture, a **"bard"** was a storyteller. They would talk about people's journeys in the world. A user interacting with an application is like a journey that the router allows you to take, tell, and remember.

## Install

```
npm install bard-router
```

### Usage

```ts
import {Router, Link, Route, html5HistoryPlugin} from 'bard-router'
```

## Build (Rslib)

Library ships as **dual CJS + ESM** plus TypeScript declarations (see `package.json` `main` / `module` / `types` / `exports`).

- **Build:** `npm run build` → `lib/` (CJS + `.d.ts`) and `esm/` (ESM `.mjs`)
- **Inspect config:** `npm run build:inspect`

Development guide: [DEVELOPMENT.md](DEVELOPMENT.md).

## Check the docs :)

[Full documentation site](https://bard-mobx-router.netlify.com)
