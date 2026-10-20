export const buildOptions = {
  entryPoints: ['./src/main.js'],
  bundle: true,
  outfile: './dist/app.js',
  minify: true,
  sourcemap: false,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
};
