const STORAGE_USER_KEY = 'pv_user_id';

export function getUserId() {
  if (typeof window === 'undefined') return null;
  let uid = localStorage.getItem(STORAGE_USER_KEY);
  if (!uid) {
    uid = 'U-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem(STORAGE_USER_KEY, uid);
  }
  return uid;
}

export async function initUser() {
  const uid = getUserId();
  try {
    const res = await fetch('/api/platforms/user/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function getCredits() {
  const uid = getUserId();
  try {
    const res = await fetch(`/api/platforms/user/credits?userId=${uid}`);
    return await res.json();
  } catch {
    return { credits: 0, transactions: [] };
  }
}

export async function spendCredits(amount, description, referenceId = '') {
  const uid = getUserId();
  try {
    const res = await fetch('/api/platforms/user/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, amount: Math.abs(amount) * -1, description, referenceId })
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function earnCredits(amount, description, referenceId = '') {
  const uid = getUserId();
  try {
    const res = await fetch('/api/platforms/user/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, amount: Math.abs(amount), description, referenceId })
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function getTransactionHistory() {
  const uid = getUserId();
  try {
    const res = await fetch(`/api/platforms/user/credits?userId=${uid}&history=1`);
    return await res.json();
  } catch {
    return { transactions: [] };
  }
}

export function calcCreditCost(durationSeconds) {
  const minutes = Math.max(1, Math.ceil(durationSeconds / 60));
  return minutes * 2;
}

export function calcWatchReward(watchSeconds, videoDurationSeconds, completionPct, feedbackQuality = 0.5) {
  const minutes = Math.max(1, Math.ceil(watchSeconds / 60));
  let reward = minutes * 1;
  if (completionPct >= 90) reward += 2;
  else if (completionPct >= 75) reward += 1;
  reward = Math.round(reward * (0.5 + feedbackQuality * 0.5));
  return Math.max(1, reward);
}

export function detectAbuse(watchEvents) {
  if (!watchEvents || watchEvents.length < 3) return false;
  const timestamps = watchEvents.map(e => e.timestamp);
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (gap < 300) return true;
  }
  return false;
}
