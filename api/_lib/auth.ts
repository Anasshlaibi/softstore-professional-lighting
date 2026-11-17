import type { VercelRequest } from '@vercel/node';

const DEFAULT_ADMIN_EMAILS = ['anasshlaibi@gmail.com', 'verdanove@gmail.com'];

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
  const parsed = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ADMIN_EMAILS;
}

export interface VerifiedSupabaseUser {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export function isAdminUser(user: VerifiedSupabaseUser | null): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === 'admin') return true;
  const email = (user.email || '').trim().toLowerCase();
  if (!email) return false;
  return getAdminEmails().includes(email);
}

export async function verifySupabaseBearerToken(
  req: VercelRequest
): Promise<VerifiedSupabaseUser | null> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://gunuqwikqhtllwplzcru.supabase.co';
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as VerifiedSupabaseUser;
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

export async function verifyAdminRequest(
  req: VercelRequest
): Promise<{ ok: true; user: VerifiedSupabaseUser } | { ok: false; status: number; error: string }> {
  const user = await verifySupabaseBearerToken(req);
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }
  if (!isAdminUser(user)) {
    return { ok: false, status: 403, error: 'Administrator privileges required' };
  }
  return { ok: true, user };
}
