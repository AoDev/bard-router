# AGENTS Guide

This file is the default entry point for AI agents working in this repository.
Project: `Type-safe React + MobX router with simple navigation APIs, hooks, and extensible plugins.`

## Core Workflow

1. Make requested code changes.
2. Run `npm run lint:agent` after any code edits.
3. If behavior changed, run `npm run test-unit`.
4. Report what changed and any commands run.

## Linting Requirement

- `npm run lint:agent` is mandatory after code modifications.
- The script performs:
  - `biome check --write`
  - `prettier --write` for Markdown/CSS
  - `biome lint` (errors only, compact output)
- Treat non-zero exit as blocking; fix issues before finishing.

## Project Conventions

- Use Typescript following rules in `.cursor/rules/typescript-rules.mdc`
- Keep changes minimal and scoped to user request.
- Do not modify release/build artifacts unless task requires it.
