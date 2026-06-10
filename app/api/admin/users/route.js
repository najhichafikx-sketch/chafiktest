import { verifyAdmin } from '@/lib/auth';
import { getUsers, getUsersStats, updateUser, deleteUserRecord } from '@/lib/db';
import { getMemoryUsers } from '@/lib/users';

export async function GET(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const [fileUsers, memoryUsers] = await Promise.all([getUsers(), getMemoryUsers()]);
    const emails = new Set();
    const merged = [];
    for (const u of [...fileUsers, ...memoryUsers]) {
      const key = u.email?.toLowerCase();
      if (!key || emails.has(key)) continue;
      emails.add(key);
      merged.push(u);
    }
    const stats = { total: merged.length, active: merged.filter(u => u.status === 'active').length, newToday: 0, newThisWeek: 0 };
    return Response.json({ success: true, users: merged, stats });
  } catch (err) {
    return Response.json({ success: false, users: [], stats: {} }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { id, ...data } = await request.json();
    if (!id) return Response.json({ success: false, message: 'id required' }, { status: 400 });
    await updateUser(id, data);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ success: false, message: 'id required' }, { status: 400 });
    await deleteUserRecord(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
