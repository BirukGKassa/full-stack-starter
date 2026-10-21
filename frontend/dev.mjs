import { spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer, request as proxyRequest } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { context } from 'esbuild';
import { buildOptions } from './build-options.mjs';

const execFileAsync = promisify(execFile);
const frontendDir = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(frontendDir, 'dist');
const indexPath = resolve(frontendDir, 'index.html');
const tailwindCli = resolve(frontendDir, 'node_modules/tailwindcss/lib/cli.js');
const port = Number(process.env.FRONTEND_PORT || 8080);
const backendPort = Number(process.env.BACKEND_PORT || 3005);
const tailwindArgs = [
  tailwindCli,
  '-i',
  './src/styles/globals.css',
  '-o',
  './dist/styles.css',
];

await execFileAsync(process.execPath, tailwindArgs, { cwd: frontendDir });

const buildContext = await context(buildOptions);
await buildContext.rebuild();
await buildContext.watch();

const tailwind = spawn(process.execPath, [...tailwindArgs, '--watch'], {
  cwd: frontendDir,
  stdio: 'inherit',
});

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    const upstream = proxyRequest({
      hostname: '127.0.0.1',
      port: backendPort,
      path: request.url,
      method: request.method,
      headers: request.headers,
    }, (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });

    upstream.on('error', (error) => {
      console.error(`API proxy failed: ${error.message}`);
      if (!response.headersSent) response.writeHead(502, { 'content-type': 'text/plain' });
      response.end('Backend unavailable');
    });

    request.pipe(upstream);
    return;
  }

  const assetPath = pathname === '/app.js'
    ? resolve(outputDir, 'app.js')
    : pathname === '/styles.css'
      ? resolve(outputDir, 'styles.css')
      : /^\/assets\/[A-Za-z0-9._-]+$/.test(pathname)
        ? resolve(frontendDir, `.${pathname}`)
      : indexPath;
  const contentType = pathname === '/app.js'
    ? 'text/javascript; charset=utf-8'
    : pathname === '/styles.css'
      ? 'text/css; charset=utf-8'
      : pathname.endsWith('.svg')
        ? 'image/svg+xml'
      : 'text/html; charset=utf-8';

  try {
    const contents = await readFile(assetPath);
    response.writeHead(200, { 'content-type': contentType });
    response.end(contents);
  } catch (error) {
    console.error(`Failed to serve ${assetPath}: ${error.message}`);
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Unable to serve frontend asset');
  }
});

server.listen(port, () => {
  console.log(`Frontend dev server running at http://localhost:${port}`);
  console.log(`Proxying /api to http://localhost:${backendPort}`);
});

function shutdown() {
  server.close();
  tailwind.kill();
  buildContext.dispose();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

tailwind.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Tailwind watcher exited with code ${code}`);
    process.exitCode = code;
    server.close();
  }
});
