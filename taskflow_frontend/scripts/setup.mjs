#!/usr/bin/env node
// One-shot Supabase setup for a fresh clone.
// Reads ../.env (project root) + .env.local, then drives the supabase CLI:
//   1. link       to your project ref
//   2. db push    apply ./supabase/migrations/*.sql
//   3. secrets    set GROQ_API_KEY
//   4. functions  deploy generate-subtasks
//
// Re-runnable. Each step is idempotent.

import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = join(__dirname, '..');
const ROOT_DIR = join(FRONTEND_DIR, '..');
const ROOT_ENV = join(ROOT_DIR, '.env');
const FRONTEND_ENV_LOCAL = join(FRONTEND_DIR, '.env.local');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const log = (...args) => console.log(...args);
const step = (n, total, title) =>
  log(`\n${CYAN}[${n}/${total}] ${title}${RESET}`);
const ok = (msg) => log(`  ${GREEN}✓${RESET} ${msg}`);
const warn = (msg) => log(`  ${YELLOW}!${RESET} ${msg}`);
const fail = (msg) => {
  log(`  ${RED}✗${RESET} ${msg}`);
  process.exit(1);
};

// Minimal .env parser: KEY=VALUE per line, '#' comments, optional surrounding quotes.
function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  const text = readFileSync(path, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: opts.silent ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      cwd: opts.cwd ?? FRONTEND_DIR,
      env: { ...process.env, ...(opts.env ?? {}) },
      shell: process.platform === 'win32', // npx.cmd needs shell on Windows
    });
    let stdout = '';
    let stderr = '';
    if (opts.silent) {
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));
    }
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(Object.assign(new Error(`${cmd} ${args.join(' ')} exited ${code}`), { stdout, stderr, code }));
    });
  });
}

// --- 0. Load env -------------------------------------------------------------
log(`${DIM}Reading env from ${ROOT_ENV}${RESET}`);
const rootEnv = parseEnvFile(ROOT_ENV);
const frontendEnv = parseEnvFile(FRONTEND_ENV_LOCAL);

const REQUIRED = {
  SUPABASE_PROJECT_REF: rootEnv.SUPABASE_PROJECT_REF,
  SUPABASE_ACCESS_TOKEN: rootEnv.SUPABASE_ACCESS_TOKEN,
  GROQ_API_KEY: rootEnv.GROQ_API_KEY,
};
const missing = Object.entries(REQUIRED).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  log(`\n${RED}Missing values in ${ROOT_ENV}:${RESET}`);
  for (const k of missing) log(`  - ${k}`);
  log(`\nCopy ${join(ROOT_DIR, '.env.example')} to .env and fill them in, then re-run.`);
  process.exit(1);
}

if (!frontendEnv.NEXT_PUBLIC_SUPABASE_URL || !frontendEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  warn(`${FRONTEND_ENV_LOCAL} is missing or incomplete.`);
  warn(`The setup will continue, but you'll need to fill it in before \`npm run dev\` works.`);
  warn(`Template: ${join(FRONTEND_DIR, '.env.example')}`);
}

const projectRef = REQUIRED.SUPABASE_PROJECT_REF;
const accessToken = REQUIRED.SUPABASE_ACCESS_TOKEN;
const groqKey = REQUIRED.GROQ_API_KEY;

// All supabase CLI commands inherit SUPABASE_ACCESS_TOKEN — no interactive login needed.
const cliEnv = { SUPABASE_ACCESS_TOKEN: accessToken };

// --- 1. Link -----------------------------------------------------------------
step(1, 4, 'Link Supabase project');
try {
  await run('npx', ['--no-install', 'supabase', 'link', '--project-ref', projectRef], { env: cliEnv });
  ok(`Linked to ${projectRef}`);
} catch (err) {
  // Re-linking the same project just prints "Finished supabase link." but
  // can also exit 0 with no-op; treat any non-zero as fatal here.
  fail(`Linking failed: ${err.message}`);
}

// --- 2. Apply migrations -----------------------------------------------------
step(2, 4, 'Apply database migrations');
try {
  await run('npx', ['--no-install', 'supabase', 'db', 'push', '--include-all'], { env: cliEnv });
  ok('Migrations applied');
} catch (err) {
  // "No new migrations to apply" exits 0 already; non-zero means a real failure.
  fail(`db push failed: ${err.message}`);
}

// --- 3. Set GROQ_API_KEY as a project secret ---------------------------------
step(3, 4, 'Set GROQ_API_KEY as a Supabase function secret');
try {
  await run(
    'npx',
    ['--no-install', 'supabase', 'secrets', 'set', `GROQ_API_KEY=${groqKey}`, '--project-ref', projectRef],
    { env: cliEnv }
  );
  ok('GROQ_API_KEY set');
} catch (err) {
  fail(`secrets set failed: ${err.message}`);
}

// --- 4. Deploy edge function -------------------------------------------------
step(4, 4, 'Deploy generate-subtasks edge function');
try {
  await run(
    'npx',
    ['--no-install', 'supabase', 'functions', 'deploy', 'generate-subtasks', '--project-ref', projectRef],
    { env: cliEnv }
  );
  ok('Function deployed');
} catch (err) {
  fail(`functions deploy failed: ${err.message}`);
}

log(`\n${GREEN}All set.${RESET} Next:`);
log(`  cd taskflow_frontend && npm run dev`);
log(`  Open http://localhost:3000\n`);
