import crypto from 'crypto';
import { query } from './db';
import {
  sbConfigured,
  createUser as sbCreateUser,
  findUserByEmail as sbFindUserByEmail,
  findUserById as sbFindUserById,
  updateUserCredits as sbUpdateUserCredits,
  getAllUsers as sbGetAllUsers,
  setResetToken as sbSetResetToken,
  findUserByResetToken as sbFindUserByResetToken,
  updatePassword as sbUpdatePassword
} from './supabase-db';
import { readJsonFile, writeJsonFile } from './file-store';

const ITERATIONS = 600000;
const USERS_DATA_FILE = 'users-data.json';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
}

export async function createUser(email, password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = hashPassword(password, salt);

  if (sbConfigured()) {
    const sbUser = await sbCreateUser(email, hash, salt);
    if (sbUser) {
      const fileUsers = loadUsersData();
      const exists = fileUsers.find(u => u.email === email);
      if (!exists) {
        fileUsers.push({ id: sbUser.id, email, name: email.split('@')[0], status: 'active', total_generations: 0, last_login: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        saveUsersData(fileUsers);
      }
      return sbUser;
    }
  }

  const existingFile = loadUsersData().find(u => u.email === email);
  if (existingFile) return null;

  const fileId = generateFileId();
  const fileUser = { id: fileId, email, password: hash, salt, credits: 5, plan: 'free', created_at: new Date().toISOString() };
  const fileUsers = loadUsersData();
  fileUsers.push({ id: fileId, email, name: email.split('@')[0], status: 'active', total_generations: 0, last_login: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  saveUsersData(fileUsers);
  return fileUser;
}

export async function findUser(email) {
  if (sbConfigured()) {
    const sbUser = await sbFindUserByEmail(email);
    if (sbUser) return sbUser;
  }

  const users = loadUsersData();
  const fileUser = users.find(u => u.email === email);
  if (!fileUser) return null;

  const fileStore = loadFileStore();
  const fullUser = fileStore.find(u => u.email === email);
  return fullUser || fileUser;
}

export async function findUserById(id) {
  if (sbConfigured()) {
    const sbUser = await sbFindUserById(id);
    if (sbUser) return sbUser;
  }

  const users = loadUsersData();
  const fileUser = users.find(u => u.id === Number(id) || u.id === id);
  if (!fileUser) return null;
  const fileStore = loadFileStore();
  const fullUser = fileStore.find(u => u.id === Number(id) || u.id === id);
  return fullUser || fileUser;
}

export async function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

export async function deductCredits(userId) {
  if (sbConfigured()) {
    const ok = await sbUpdateUserCredits(userId, 1);
    if (ok) return;
  }
  const users = loadFileStore();
  const user = users.find(u => u.id === Number(userId) || u.id === userId);
  if (user && user.credits > 0) {
    user.credits -= 1;
    saveFileStore(users);
  }
}

export async function getDailyGenerationCount(userId) {
  try {
    const rows = await query(
      "SELECT COUNT(*) as count FROM generations WHERE user_id = $1 AND created_at::date = CURRENT_DATE",
      [userId]
    );
    if (rows) return rows?.[0]?.count || 0;
  } catch {}
  return 0;
}

export async function getUsers() {
  return loadUsersData();
}

export async function getUserByEmail(email) {
  const users = loadUsersData();
  return users.find(u => u.email === email) || null;
}

export async function createUserRecord(userData) {
  const users = loadUsersData();
  const now = new Date().toISOString();
  const user = {
    id: users.length + 1,
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    status: 'active',
    total_generations: 0,
    last_login: now,
    created_at: now,
    updated_at: now
  };
  users.push(user);
  saveUsersData(users);
  return user;
}

export async function updateUser(id, data) {
  const users = loadUsersData();
  const idx = users.findIndex(u => u.id === Number(id) || u.id === id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...data, updated_at: new Date().toISOString() };
    saveUsersData(users);
  }
}

export async function deleteUserRecord(id) {
  const users = loadUsersData();
  saveUsersData(users.filter(u => u.id !== Number(id) && u.id !== id));
}

export async function getUsersStats() {
  const users = loadUsersData();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    newToday: users.filter(u => u.created_at && u.created_at.startsWith(today)).length,
    newThisWeek: users.filter(u => u.created_at && u.created_at >= sevenDaysAgo).length,
    newThisMonth: users.filter(u => u.created_at && u.created_at >= thirtyDaysAgo).length
  };
}

export async function setResetToken(email, token, expiresAt) {
  if (sbConfigured()) {
    const ok = await sbSetResetToken(email, token, expiresAt);
    if (ok) return true;
  }
  const users = loadFileStore();
  const user = users.find(u => u.email === email);
  if (!user) return false;
  user.reset_token = token;
  user.reset_token_expires = expiresAt.toISOString();
  saveFileStore(users);
  return true;
}

export async function findUserByResetToken(token) {
  if (sbConfigured()) {
    const sbUser = await sbFindUserByResetToken(token);
    if (sbUser) return sbUser;
  }
  const users = loadFileStore();
  return users.find(u => u.reset_token === token && u.reset_token_expires && new Date(u.reset_token_expires) > new Date()) || null;
}

export async function updatePasswordById(userId, password, salt) {
  if (sbConfigured()) {
    const ok = await sbUpdatePassword(userId, password, salt);
    if (ok) return true;
  }
  const users = loadFileStore();
  const user = users.find(u => u.id === Number(userId) || u.id === userId);
  if (!user) return false;
  user.password = password;
  user.salt = salt;
  user.reset_token = '';
  user.reset_token_expires = null;
  saveFileStore(users);
  return true;
}

// File storage helpers

function loadUsersData() {
  return readJsonFile(USERS_DATA_FILE);
}

function saveUsersData(users) {
  writeJsonFile(USERS_DATA_FILE, users);
}

function loadFileStore() {
  return readJsonFile('users-store.json');
}

function saveFileStore(users) {
  writeJsonFile('users-store.json', users);
}

let fileIdCounter = 1000;
function generateFileId() {
  return ++fileIdCounter;
}
