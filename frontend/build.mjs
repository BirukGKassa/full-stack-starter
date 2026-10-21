import { build } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildOptions } from './build-options.mjs';

await build({ ...buildOptions, define: { 'process.env.NODE_ENV': '"production"' } });
const assetsDirectory = resolve('./dist/assets');
await mkdir(assetsDirectory, { recursive: true });
await cp(resolve('./assets'), assetsDirectory, { recursive: true });
