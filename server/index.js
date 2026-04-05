import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readContent, writeContent } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webappDist = path.join(__dirname, '..', 'webapp', 'dist');
const app = express();
const PORT = Number(process.env.PORT || 8080);
const OWNER_LOGIN = process.env.OWNER_LOGIN || 'owner';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'owner123';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-now';

app.use(express.json({ limit: '2mb' }));

function signOwnerToken() {
  return jwt.sign({ role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
}

function requireOwner(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== 'object' || payload.role !== 'owner') {
      return res.status(401).json({ error: 'Недостаточно прав' });
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/content', async (_req, res) => {
  const content = await readContent();
  res.json(content);
});

app.post('/api/owner/login', (req, res) => {
  const { login, password } = req.body ?? {};
  if (login !== OWNER_LOGIN || password !== OWNER_PASSWORD) {
    return res.status(401).json({ error: 'Неверные данные' });
  }
  return res.json({ token: signOwnerToken() });
});

app.put('/api/owner/content', requireOwner, async (req, res) => {
  const content = req.body;
  const saved = await writeContent(content);
  res.json(saved);
});

app.use(express.static(webappDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webappDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kalyanny Master app started on port ${PORT}`);
});
