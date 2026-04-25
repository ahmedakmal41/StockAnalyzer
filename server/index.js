import { createHash, pbkdf2Sync, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(join(dataDir, 'app.sqlite'));
const PORT = Number(process.env.API_PORT || 8787);

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    shares REAL NOT NULL,
    avg_price REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const json = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  });
  response.end(JSON.stringify(payload));
};

const parseBody = (request) => new Promise((resolve, reject) => {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) request.destroy();
  });
  request.on('end', () => {
    if (!body) return resolve({});
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
});

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const hashPassword = (password, salt = randomBytes(16).toString('hex')) => ({
  salt,
  hash: pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex'),
});

const publicUser = (user) => user && ({ id: user.id, name: user.name, email: user.email });

const createSession = (userId) => {
  const token = createHash('sha256').update(`${userId}:${randomBytes(32).toString('hex')}`).digest('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
  return token;
};

const getAuthUser = (request) => {
  const auth = request.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  return db.prepare(`
    SELECT users.id, users.name, users.email
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ?
  `).get(token);
};

const requireUser = (request, response) => {
  const user = getAuthUser(request);
  if (!user) json(response, 401, { error: 'Authentication required' });
  return user;
};

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {});

  const url = new URL(request.url, `http://${request.headers.host}`);
  const path = url.pathname;

  try {
    if (request.method === 'POST' && path === '/api/auth/signup') {
      const { name, email, password } = await parseBody(request);
      if (!name?.trim() || !email?.trim() || String(password || '').length < 6) {
        return json(response, 400, { error: 'Name, email, and a 6+ character password are required' });
      }
      const { salt, hash } = hashPassword(password);
      try {
        const result = db.prepare('INSERT INTO users (name, email, password_hash, salt) VALUES (?, ?, ?, ?)')
          .run(name.trim(), email.trim().toLowerCase(), hash, salt);
        const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid);
        return json(response, 201, { user: publicUser(user), token: createSession(user.id) });
      } catch (error) {
        if (String(error.message).includes('UNIQUE')) return json(response, 409, { error: 'Email is already registered' });
        throw error;
      }
    }

    if (request.method === 'POST' && path === '/api/auth/login') {
      const { email, password } = await parseBody(request);
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').trim().toLowerCase());
      if (!user) return json(response, 401, { error: 'Invalid email or password' });
      const { hash } = hashPassword(password, user.salt);
      if (hash !== user.password_hash) return json(response, 401, { error: 'Invalid email or password' });
      return json(response, 200, { user: publicUser(user), token: createSession(user.id) });
    }

    if (request.method === 'GET' && path === '/api/me') {
      const user = requireUser(request, response);
      if (!user) return;
      return json(response, 200, { user: publicUser(user) });
    }

    if (request.method === 'GET' && path === '/api/watchlist') {
      const user = requireUser(request, response);
      if (!user) return;
      const items = db.prepare('SELECT id, symbol, created_at FROM watchlist WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
      return json(response, 200, { items });
    }

    if (request.method === 'POST' && path === '/api/watchlist') {
      const user = requireUser(request, response);
      if (!user) return;
      const { symbol } = await parseBody(request);
      const normalized = normalizeSymbol(symbol);
      if (!normalized) return json(response, 400, { error: 'Symbol is required' });
      db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol) VALUES (?, ?)').run(user.id, normalized);
      return json(response, 201, { ok: true });
    }

    if (request.method === 'DELETE' && path.startsWith('/api/watchlist/')) {
      const user = requireUser(request, response);
      if (!user) return;
      db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(user.id, normalizeSymbol(path.split('/').pop()));
      return json(response, 200, { ok: true });
    }

    if (request.method === 'GET' && path === '/api/holdings') {
      const user = requireUser(request, response);
      if (!user) return;
      const items = db.prepare('SELECT id, symbol, shares, avg_price, created_at FROM holdings WHERE user_id = ? ORDER BY symbol').all(user.id);
      return json(response, 200, { items });
    }

    if (request.method === 'POST' && path === '/api/holdings') {
      const user = requireUser(request, response);
      if (!user) return;
      const { symbol, shares, avgPrice } = await parseBody(request);
      const normalized = normalizeSymbol(symbol);
      const shareCount = Number(shares);
      const averagePrice = Number(avgPrice);
      if (!normalized || !Number.isFinite(shareCount) || shareCount <= 0 || !Number.isFinite(averagePrice) || averagePrice <= 0) {
        return json(response, 400, { error: 'Symbol, shares, and average price are required' });
      }
      db.prepare(`
        INSERT INTO holdings (user_id, symbol, shares, avg_price)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, symbol) DO UPDATE SET shares = excluded.shares, avg_price = excluded.avg_price
      `).run(user.id, normalized, shareCount, averagePrice);
      return json(response, 201, { ok: true });
    }

    if (request.method === 'DELETE' && path.startsWith('/api/holdings/')) {
      const user = requireUser(request, response);
      if (!user) return;
      db.prepare('DELETE FROM holdings WHERE user_id = ? AND symbol = ?').run(user.id, normalizeSymbol(path.split('/').pop()));
      return json(response, 200, { ok: true });
    }

    return json(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Local API listening on http://localhost:${PORT}`);
});
