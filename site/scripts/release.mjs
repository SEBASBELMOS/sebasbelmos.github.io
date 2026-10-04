// Builds the Astro site and publishes it to the repository root, which is
// what GitHub Pages serves (legacy build, branch main, path /).
// Usage: npm run release   (from site/)
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(site, '..');
const dist = join(site, 'dist');

execSync('npx astro build', { cwd: site, stdio: 'inherit', env: { ...process.env, BASE_PATH: '/' } });

// Everything the published site owns at the root. Only these are replaced;
// source, docs and git files are never touched.
const owned = [
  'index.html', '404.html', 'en', 'work', '_astro', 'assets',
  // Files from the previous site, removed on the first release.
  'app.js', 'styles.css', 'research.css', 'site-config.js', 'analytics.js',
];
for (const name of owned) rmSync(join(root, name), { recursive: true, force: true });

// Image provenance sidecars (*.webp.json, *.png.json) are build records, not site files.
const isSidecar = (src) => /\.(webp|png|jpe?g)\.json$/i.test(src);
for (const name of readdirSync(dist)) {
  cpSync(join(dist, name), join(root, name), { recursive: true, filter: (src) => !isSidecar(src) });
}

const missing = ['index.html', '404.html', 'en/index.html', 'work/index.html'].filter((f) => !existsSync(join(root, f)));
if (missing.length) throw new Error(`Release incomplete, missing: ${missing.join(', ')}`);
console.log(`Published ${readdirSync(dist).length} entries from site/dist to the repository root.`);
