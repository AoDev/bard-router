#!/usr/bin/env node
/**
 * lint-agent: Token-optimized lint + format for AI agents.
 * call: npm run lint:agent or ts-node scripts/lint-agent.ts
 *
 * Runs biome (auto-fix) + prettier (auto-fix), then reports only remaining
 * Biome errors in compact grouped format. Warnings are suppressed — they are
 * pre-existing accepted issues and do not require agent action.
 *
 * Output format:
 *   OK                                  ← nothing to fix
 *   FORMATTED: src/foo.less, BACKLOG.md ← prettier changed files
 *   ERRORS (N total, G groups):
 *     [lint/rule]
 *     message
 *     - src/foo.ts:15:8
 *     - src/bar.ts:22:1
 *
 * Exit code: 0 = clean, 1 = errors remain
 */

import {spawnSync} from 'node:child_process'

const BIOME = './node_modules/.bin/biome'
const PRETTIER = './node_modules/.bin/prettier'

// Step 1: biome check --write (format + safe lint fixes for JS/TS/TSX/JSX)
spawnSync(BIOME, ['check', '--write'], {stdio: 'ignore'})

// Step 2: prettier --write for files biome doesn't cover (.md, .css)
// Intentionally NOT passing JS/TS/JSON — biome owns those; running both causes format ping-pong.
const prettierOut = spawnSync(PRETTIER, ['--write', '**/*.md', '**/*.css', '--ignore-unknown'], {
  encoding: 'utf8',
})
const prettierChanged = `${prettierOut.stdout ?? ''}${prettierOut.stderr ?? ''}`
  .split('\n')
  .map((ln) => ln.trim())
  .filter(
    (ln) => ln && !ln.includes('(unchanged)') && !ln.startsWith('[warn]') && !ln.startsWith('$')
  )
  .map((ln) => ln.replace(/\s+\d+ms$/, '')) // strip timing suffix

// Step 3: biome lint --reporter=json to get remaining issues (errors only)
const lintOut = spawnSync(BIOME, ['lint', '.', '--reporter=json', '--diagnostic-level=error'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
})

type BiomeDiag = {
  severity: string
  message: string
  category: string
  location: {path: string; start: {line: number; column: number}}
}

type BiomeReport = {diagnostics: BiomeDiag[]; summary: {errors: number}}
type GroupedError = {rule: string; msg: string; locations: string[]}

const errors: Array<{file: string; line: number; col: number; rule: string; msg: string}> = []

try {
  const report = JSON.parse(lintOut.stdout ?? '') as BiomeReport
  for (const d of report.diagnostics ?? []) {
    if (d.severity !== 'error') {
      continue
    }
    errors.push({
      file: d.location.path,
      line: d.location.start.line,
      col: d.location.start.column,
      rule: d.category,
      msg: d.message,
    })
  }
} catch {
  // biome not available or output malformed — fall through with empty errors
}

if (prettierChanged.length > 0) {
  console.log(`FORMATTED: ${prettierChanged.join(', ')}`)
}

if (errors.length === 0) {
  console.log('OK')
  process.exit(0)
}

const groupedByRuleAndMessage = new Map<string, GroupedError>()
const sortedErrors = [...errors].sort((a, b) => {
  if (a.file !== b.file) {
    return a.file.localeCompare(b.file)
  }
  if (a.line !== b.line) {
    return a.line - b.line
  }
  return a.col - b.col
})

for (const e of sortedErrors) {
  const key = `${e.rule}\n${e.msg}`
  const location = `${e.file}:${e.line}:${e.col}`
  const existing = groupedByRuleAndMessage.get(key)
  if (!existing) {
    groupedByRuleAndMessage.set(key, {rule: e.rule, msg: e.msg, locations: [location]})
    continue
  }
  existing.locations.push(location)
}

const groupedErrors = [...groupedByRuleAndMessage.values()].sort((a, b) => {
  if (a.locations.length !== b.locations.length) {
    return b.locations.length - a.locations.length
  }
  if (a.rule !== b.rule) {
    return a.rule.localeCompare(b.rule)
  }
  return a.msg.localeCompare(b.msg)
})

console.log(`ERRORS (${errors.length} total, ${groupedErrors.length} groups):`)
for (const g of groupedErrors) {
  console.log(`  [${g.rule}]`)
  console.log(`  ${g.msg}`)
  for (const location of g.locations) {
    console.log(`  - ${location}`)
  }
}
process.exit(1)
