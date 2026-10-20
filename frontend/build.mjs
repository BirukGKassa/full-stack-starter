import { build } from 'esbuild';
import { buildOptions } from './build-options.mjs';

await build({ ...buildOptions, define: { 'process.env.NODE_ENV': '"production"' } });
