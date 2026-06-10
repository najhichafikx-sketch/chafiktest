import crypto from 'crypto';
import { query } from './db';

const ITERATIONS = 600000;

const memoryUsers = [];
let memoryIdCounter = 1;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
}

function dbAvailable() {
  return !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
}

export async function createUser(email, password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = hashPassword(password, salt);

  try {
    if (dbAvailable()) {
      const rows = await query(
        'INSERT INTO users (email, password, salt, credits, plan) VALUES ($1, $2, $3, 5, $4) RETURNING id, email, credits, plan, created_at',
        [email, hash, salt, 'free']
      );
      if (rows) return rows?.[0] || null;
    }
  } catch { /* DB unavailable — fall back to memory */ }

  const existing = memoryUsers.find(u => u.email === email);
  if (existing) return null;

  const user = {
    id: memoryIdCounter++,
    email,
    password: hash,
    salt,
    credits: 5,
    plan: 'free',
    created_at: new Date().toISOString()
  };
  memoryUsers.push(user);
  return { id: user.id, email: user.email, credits: user.credits, plan: user.plan, created_at: user.created_at };
}

export async function findUser(email) {
  try {
    if (dbAvailable()) {
      const rows = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows) return rows?.[0] || null;
    }
  } catch { /* DB unavailable — fall back to memory */ }

  return memoryUsers.find(u => u.email === email) || null;
}

export async function findUserById(id) {
  const numId = Number(id);

  try {
    if (dbAvailable()) {
      const rows = await query('SELECT id, email, credits, plan, created_at FROM users WHERE id = $1', [numId]);
      if (rows) return rows?.[0] || null;
    }
  } catch { /* DB unavailable — fall back to memory */ }

  const user = memoryUsers.find(u => u.id === numId);
  if (!user) return null;
  return { id: user.id, email: user.email, credits: user.credits, plan: user.plan, created_at: user.created_at };
}

export async function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

export async function deductCredits(userId) {
  try {
    if (dbAvailable()) {
      await query('UPDATE users SET credits = credits - 1 WHERE id = $1 AND credits > 0', [userId]);
      return;
    }
  } catch { /* DB unavailable — fall back to memory */ }

  const user = memoryUsers.find(u => u.id === Number(userId));
  if (user && user.credits > 0) user.credits -= 1;
}

export async function getDailyGenerationCount(userId) {
  try {
    if (dbAvailable()) {
      const rows = await query(
        "SELECT COUNT(*) as count FROM generations WHERE user_id = $1 AND created_at::date = CURRENT_DATE",
        [userId]
      );
      if (rows) return rows?.[0]?.count || 0;
    }
  } catch { /* DB unavailable */ }

  return 0;
}
