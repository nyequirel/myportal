import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
if (existsSync('server/.env')) process.loadEnvFile('server/.env');
const url = process.env.APP_URL || 'http://localhost:3000';
let running = false;
try {
  const response = await fetch(new URL('/api/auth/status', url), { signal: AbortSignal.timeout(1200) });
  const state = await response.json();
  running = response.ok && typeof state.authenticated === 'boolean' && typeof state.pending === 'boolean';
} catch { /* Start the local server when no compatible server is responding. */ }
if (running) console.log(`MyPublic is already running. Open ${url}`);
else {
  console.log(`Starting MyPublic. Open ${url}\nKeep this window open. Press Ctrl+C to stop.`);
  const child = spawn(process.execPath, ['--env-file-if-exists=server/.env', resolve(root, 'server/index.mjs')], { cwd: root, stdio: 'inherit', windowsHide: true });
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
