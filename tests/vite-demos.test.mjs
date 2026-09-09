import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = path => readFileSync(resolve(path), 'utf8');

test('both portfolio demos have Vite source and production build commands', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.devDependencies.vite);
  for (const script of ['dev:egp', 'dev:assets', 'build:egp', 'build:assets', 'build:demos']) {
    assert.ok(pkg.scripts[script], `missing ${script}`);
  }

  for (const demo of ['egp', 'computer-assets']) {
    assert.match(read(`apps/${demo}/vite.config.mjs`), /defineConfig/);
    assert.match(read(`apps/${demo}/src/main.js`), /import ['"]\.\/demo\.css['"]/);
    assert.ok(read(`apps/${demo}/index.html`).includes('src="/src/main.js"'));
    assert.match(read(`docs/demos/${demo}/index.html`), /assets\/main-[\w-]+\.js/);
    assert.doesNotMatch(read(`docs/demos/${demo}/index.html`), /src="\/src\/main\.js"/);
  }
});

test('Vite source data and GitHub Pages output stay identical', () => {
  const files = [
    ['egp', 'announcements.json'],
    ['egp', 'queues.json'],
    ['egp', 'manifest.json'],
    ['computer-assets', 'assets.json'],
    ['computer-assets', 'schema.json'],
    ['computer-assets', 'manifest.json'],
  ];
  for (const [demo, file] of files) {
    assert.equal(read(`apps/${demo}/public/data/${file}`), read(`docs/demos/${demo}/data/${file}`));
  }
});
