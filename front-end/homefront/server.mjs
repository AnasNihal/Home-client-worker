import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const mimeTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (pathname === '/health' || pathname === '/health/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('ok');
    return;
  }

  const requestedPath = path.resolve(distDirectory, `.${pathname}`);
  const relativePath = path.relative(distDirectory, requestedPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    response.writeHead(404).end();
    return;
  }

  let filePath = requestedPath;
  try {
    if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    await stat(filePath);
  } catch {
    // Client-side routes have no corresponding file; serve the SPA entry point.
    // Missing assets should remain 404s instead of returning HTML as JavaScript.
    if (path.extname(pathname)) {
      response.writeHead(404).end();
      return;
    }
    filePath = path.join(distDirectory, 'index.html');
  }

  try {
    const body = await readFile(filePath);
    const isHashedAsset = pathname.startsWith('/assets/');
    response.writeHead(200, {
      'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Length': body.length,
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end();
  }
});

const port = Number(process.env.PORT || 4173);
server.listen(port, '0.0.0.0');
