const USERS_KEY = 'signscous-users-v1';
const SESSION_KEY = 'signscous-session-v1';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function seedAdminIfMissing() {
  const users = readJson(USERS_KEY, []);
  const hasAdmin = users.some((u) => u.email === 'admin@signscous.com');
  if (!hasAdmin) {
    users.push({
      id: `user-${Date.now()}`,
      name: 'Signscous Admin',
      email: 'admin@signscous.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    writeJson(USERS_KEY, users);
  }
}

export function initAuthStore() {
  seedAdminIfMissing();
}

export function registerMockUser({ name, email, password }) {
  initAuthStore();
  const users = readJson(USERS_KEY, []);
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email is already registered.');
  }

  const user = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name,
    email,
    password,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeJson(USERS_KEY, users);
  writeJson(SESSION_KEY, { userId: user.id });

  return sanitizeUser(user);
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function loginMockUser({ email, password }) {
  initAuthStore();
  const users = readJson(USERS_KEY, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  writeJson(SESSION_KEY, { userId: user.id });
  return sanitizeUser(user);
}

export function getCurrentMockUser() {
  initAuthStore();
  const users = readJson(USERS_KEY, []);
  const session = readJson(SESSION_KEY, null);
  if (!session?.userId) return null;
  const user = users.find((u) => u.id === session.userId);
  return sanitizeUser(user || null);
}

export function logoutMockUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}
