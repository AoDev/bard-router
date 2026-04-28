---
name: lint-agent
description: Run Biome + Prettier after code changes, then report compact Biome errors.
---

# Lint + Format (agent-optimized)

Run this after **any TypeScript, JavaScript, Markdown, or CSS change**:

```bash
npm run lint:agent
```

## What it does

1. **`biome check --write`** — formats and auto-fixes all safe lint issues in JS/TS/JSX/TSX
2. **`prettier --write`** — formats Markdown and CSS (Biome owns JS/TS)
3. **`biome lint`** (errors only, JSON) — remaining issues reported in grouped compact form

## Output

**Clean (Biome clean):**

```
OK
```

**With auto-format side effects:**

```
FORMATTED: tasks/BACKLOG.md, documentation/website/static/css/custom.css
OK
```

**Biome errors remain:**

```
ERRORS (2 total, 2 groups):
  [lint/correctness/noUnusedVariables]
  'x' is defined but never used
  - src/foo.ts:15:8
  [lint/complexity/noVoid]
  Unexpected use of the void operator
  - src/bar.ts:22:1
```

## Rules

- Exit code `0` = clean, safe to proceed
- Exit code `1` = Biome errors remain; fix before committing
- Warnings are suppressed for Biome — they are pre-existing accepted issues, not agent tasks
- Do not add Biome ignore comments to suppress errors; fix the underlying code
