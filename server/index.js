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
const USER_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

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

function getIsoDate() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function sanitizeText(value, maxLength = 120) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizePhone(value) {
  const raw = String(value ?? '').trim();
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (digits.length < 10 || digits.length > 15) return '';
  return `${hasPlus ? '+' : '+'}${digits}`;
}

function normalizeContent(content) {
  return {
    ...content,
    banners: Array.isArray(content?.banners) ? content.banners : [],
    mixes: Array.isArray(content?.mixes) ? content.mixes : [],
    products: Array.isArray(content?.products) ? content.products : [],
    brands: Array.isArray(content?.brands) ? content.brands : [],
    news: Array.isArray(content?.news) ? content.news : [],
    collections: Array.isArray(content?.collections) ? content.collections : [],
    users: Array.isArray(content?.users) ? content.users : [],
    ratings: Array.isArray(content?.ratings) ? content.ratings : []
  };
}

function getPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    nickname: user.nickname
  };
}

function getRatingSummaries(ratings) {
  const grouped = new Map();

  ratings.forEach((rating) => {
    if (!rating || typeof rating.value !== 'number') return;
    const key = `${rating.targetType}:${rating.targetId}`;
    const current = grouped.get(key) ?? {
      targetType: rating.targetType,
      targetId: rating.targetId,
      count: 0,
      total: 0
    };

    current.count += 1;
    current.total += rating.value;
    grouped.set(key, current);
  });

  return [...grouped.values()].map((item) => ({
    targetType: item.targetType,
    targetId: item.targetId,
    count: item.count,
    average: Math.round((item.total / item.count) * 10) / 10
  }));
}

function getPublicContent(content) {
  const normalized = normalizeContent(content);
  const { users, ratings, ...publicContent } = normalized;
  return {
    ...publicContent,
    ratingSummaries: getRatingSummaries(ratings)
  };
}

function stripComputedContentFields(content) {
  const { ratingSummaries, ...cleanContent } = content;
  return cleanContent;
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

function signUserToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  return signPayload({ role: 'user', sub: userId, iat: now, exp: now + USER_TOKEN_TTL_SECONDS });
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

async function requireUser(req, res) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    sendError(res, 401, 'Требуется вход по телефону');
    return null;
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = verifyPayload(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'user' || typeof payload.sub !== 'string') {
      sendError(res, 401, 'Недействительный токен пользователя');
      return null;
    }

    const content = normalizeContent(await readContent());
    const user = content.users.find((item) => item.id === payload.sub);
    if (!user) {
      sendError(res, 401, 'Пользователь не найден');
      return null;
    }

    return { content, user };
  } catch {
    sendError(res, 401, 'Недействительный токен пользователя');
    return null;
  }
}

function getUserRatings(content, userId) {
  return content.ratings.filter((rating) => rating.userId === userId);
}

function findRatingSummary(content, targetType, targetId) {
  return getRatingSummaries(content.ratings).find((summary) => summary.targetType === targetType && summary.targetId === targetId) ?? {
    targetType,
    targetId,
    average: 0,
    count: 0
  };
}

function validateRatingTarget(content, targetType, targetId) {
  if (targetType === 'mix') {
    return content.mixes.some((mix) => mix.id === targetId);
  }

  if (targetType === 'taste') {
    return content.mixes.some((mix) => Array.isArray(mix.notes) && mix.notes.includes(targetId));
  }

  return false;
}

function buildUserMix(body, user) {
  const title = sanitizeText(body.title, 80);
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map((item) => sanitizeText(item, 40)).filter(Boolean).slice(0, 6)
    : [];
  const notes = Array.isArray(body.notes)
    ? body.notes.map((item) => sanitizeText(item, 24).toLowerCase()).filter(Boolean).slice(0, 6)
    : [];

  if (!title || ingredients.length < 2 || notes.length < 1) {
    return null;
  }

  const now = getIsoDate();
  const subtitle = sanitizeText(body.subtitle, 120) || ingredients.join(' · ');
  const description = sanitizeText(body.description, 260) || `Авторский микс от ${user.nickname}: ${ingredients.join(', ')}.`;
  const details = sanitizeText(body.details, 420) || 'Добавлен пользователем через кальянный миксер. Пропорции можно корректировать под чашу, жар и желаемую плотность вкуса.';

  return {
    id: createId('mix-user'),
    title,
    subtitle,
    image: sanitizeText(body.image, 180) || '/media/mix-tropic.png',
    description,
    details,
    ingredients,
    notes: [...new Set(notes)],
    isPopular: false,
    authorId: user.id,
    authorNickname: user.nickname,
    createdAt: now
  };
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
    sendJson(res, 200, getPublicContent(content));
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
    const existing = normalizeContent(await readContent());
    const content = stripComputedContentFields(await readJsonBody(req));
    const saved = await writeContent({
      ...content,
      users: Array.isArray(content.users) ? content.users : existing.users,
      ratings: Array.isArray(content.ratings) ? content.ratings : existing.ratings
    });
    sendJson(res, 200, getPublicContent(saved));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/users/register') {
    const { phone, nickname } = await readJsonBody(req);
    const normalizedPhone = normalizePhone(phone);
    const safeNickname = sanitizeText(nickname, 32);

    if (!normalizedPhone) {
      sendError(res, 400, 'Введите корректный номер телефона');
      return;
    }

    if (safeNickname.length < 2) {
      sendError(res, 400, 'Никнейм должен быть не короче 2 символов');
      return;
    }

    const content = normalizeContent(await readContent());
    const now = getIsoDate();
    let user = content.users.find((item) => item.phone === normalizedPhone);

    if (user) {
      user = { ...user, nickname: safeNickname, updatedAt: now };
      content.users = content.users.map((item) => (item.id === user.id ? user : item));
    } else {
      user = {
        id: createId('user'),
        phone: normalizedPhone,
        nickname: safeNickname,
        createdAt: now,
        updatedAt: now
      };
      content.users = [...content.users, user];
    }

    await writeContent(content);
    sendJson(res, 200, {
      token: signUserToken(user.id),
      user: getPublicUser(user),
      ratings: getUserRatings(content, user.id)
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/users/me') {
    const session = await requireUser(req, res);
    if (!session) return;
    sendJson(res, 200, {
      user: getPublicUser(session.user),
      ratings: getUserRatings(session.content, session.user.id)
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/users/ratings') {
    const session = await requireUser(req, res);
    if (!session) return;

    const body = await readJsonBody(req);
    const targetType = sanitizeText(body.targetType, 12);
    const targetId = sanitizeText(body.targetId, 140);
    const value = Number(body.value);

    if (!['mix', 'taste'].includes(targetType) || !targetId || !Number.isFinite(value) || value < 1 || value > 5) {
      sendError(res, 400, 'Некорректная оценка');
      return;
    }

    if (!validateRatingTarget(session.content, targetType, targetId)) {
      sendError(res, 404, 'Объект оценки не найден');
      return;
    }

    const now = getIsoDate();
    const existingRating = session.content.ratings.find((rating) => rating.userId === session.user.id && rating.targetType === targetType && rating.targetId === targetId);

    if (existingRating) {
      existingRating.value = Math.round(value);
      existingRating.updatedAt = now;
    } else {
      session.content.ratings.push({
        id: createId('rating'),
        userId: session.user.id,
        targetType,
        targetId,
        value: Math.round(value),
        createdAt: now,
        updatedAt: now
      });
    }

    await writeContent(session.content);
    sendJson(res, 200, {
      rating: session.content.ratings.find((rating) => rating.userId === session.user.id && rating.targetType === targetType && rating.targetId === targetId),
      summary: findRatingSummary(session.content, targetType, targetId)
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/users/mixes') {
    const session = await requireUser(req, res);
    if (!session) return;

    const mix = buildUserMix(await readJsonBody(req), session.user);
    if (!mix) {
      sendError(res, 400, 'Укажите название, минимум два вкуса и направление микса');
      return;
    }

    session.content.mixes = [mix, ...session.content.mixes];
    await writeContent(session.content);
    sendJson(res, 201, { mix });
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
