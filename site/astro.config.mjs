import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://sebasbelmos.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  vite: { build: { target: 'es2022' } },
});
