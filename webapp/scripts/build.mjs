import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));

function run(binary, args) {
  const result = spawnSync(process.execPath, [binary, ...args], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const typescriptRoot = path.dirname(require.resolve('typescript/package.json'));
const viteRoot = path.dirname(require.resolve('vite/package.json'));

run(path.join(typescriptRoot, 'bin', 'tsc'), ['--noEmit']);
run(path.join(viteRoot, 'bin', 'vite.js'), ['build']);
