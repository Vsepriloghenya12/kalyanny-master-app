import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readContent, writeContent } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webappDist = path.join(__dirname, '..', 'webapp', 'dist');
const PORT = Number(process.env.PORT || 8080);
const OWNER_LOGIN = process.env.OWNER_LOGIN || 'owner';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'owner123';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-now';
const MAX_JSON_BODY_SIZE = 2 * 1024 * 1024;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

async function readJsonBody(req) {
  const chunks = [];
  let received = 0;

  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_JSON_BODY_SIZE) {
      throw new Error('BODY_TOO_LARGE');
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function signPayload(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('INVALID_TOKEN');
  }

  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('INVALID_TOKEN');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('INVALID_TOKEN');
  }

  return payload;
}

function signOwnerToken() {
  const now = Math.floor(Date.now() / 1000);
  return signPayload({ role: 'owner', iat: now, exp: now + 7 * 24 * 60 * 60 });
}

function requireOwner(req, res) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    sendError(res, 401, 'Требуется авторизация');
    return false;
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = verifyPayload(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'owner') {
      sendError(res, 401, 'Недостаточно прав');
      return false;
    }
    return true;
  } catch {
    sendError(res, 401, 'Недействительный токен');
    return false;
  }
}

function getStaticPath(urlPathname) {
  const pathname = decodeURIComponent(urlPathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const targetPath = path.resolve(webappDist, relativePath);
  const rootPath = path.resolve(webappDist);
  const targetLower = targetPath.toLowerCase();
  const rootLower = rootPath.toLowerCase();

  if (targetLower !== rootLower && !targetLower.startsWith(`${rootLower}${path.sep}`)) {
    return null;
  }

  return targetPath;
}

async function sendStaticFile(req, res, targetPath) {
  const file = await fs.readFile(targetPath);
  const contentType = MIME_TYPES[path.extname(targetPath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(file);
}

async function serveStatic(req, res, url) {
  const staticPath = getStaticPath(url.pathname);
  if (!staticPath) {
    sendError(res, 403, 'Доступ запрещен');
    return;
  }

  try {
    const stats = await fs.stat(staticPath);
    if (stats.isFile()) {
      await sendStaticFile(req, res, staticPath);
      return;
    }
  } catch {
    // Unknown SPA routes fall through to index.html.
  }

  await sendStaticFile(req, res, path.join(webappDist, 'index.html'));
}

async function handleRequest(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/content') {
    const content = await readContent();
    sendJson(res, 200, content);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/owner/login') {
    const { login, password } = await readJsonBody(req);
    if (login !== OWNER_LOGIN || password !== OWNER_PASSWORD) {
      sendError(res, 401, 'Неверные данные');
      return;
    }
    sendJson(res, 200, { token: signOwnerToken() });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/owner/content') {
    if (!requireOwner(req, res)) return;
    const content = await readJsonBody(req);
    const saved = await writeContent(content);
    sendJson(res, 200, saved);
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    await serveStatic(req, res, url);
    return;
  }

  sendError(res, 404, 'Не найдено');
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error instanceof SyntaxError) {
      sendError(res, 400, 'Некорректный JSON');
      return;
    }
    if (error instanceof Error && error.message === 'BODY_TOO_LARGE') {
      sendError(res, 413, 'Слишком большой запрос');
      return;
    }
    console.error(error);
    sendError(res, 500, 'Внутренняя ошибка сервера');
  });
});

server.listen(PORT, () => {
  console.log(`Kalyanny Master app started on port ${PORT}`);
});
