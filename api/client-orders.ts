import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifySupabaseBearerToken, isAdminUser } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://gunuqwikqhtllwplzcru.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const authUser = await verifySupabaseBearerToken(req);
  const { phone = '', ref = '' } = req.body || {};
  const cleanPhone = String(phone).replace(/[^0-9]/g, '').slice(-8);
  const cleanRef = String(ref).trim().toLowerCase();

  // Security Rule: Never return unauthenticated bulk lookups.
  // Either user is authenticated (scoped strictly to their verified email),
  // OR guest provides BOTH a specific reference (>= 5 chars) AND a matching phone (>= 6 digits).
  if (!authUser && (cleanRef.length < 5 || cleanPhone.length < 6)) {
    return res.status(401).json({
      error: 'Connectez-vous à votre compte client ou saisissez votre référence + téléphone.',
      orders: [],
    });
  }

  const queryKey = serviceKey || anonKey;
  if (!queryKey) {
    return res.status(500).json({ error: 'Supabase server key missing', orders: [] });
  }

  const headers: Record<string, string> = {
    apikey: queryKey,
    Authorization: `Bearer ${serviceKey || (req.headers.authorization || '').slice(7)}`,
  };

  try {
    let url = `${supabaseUrl}/rest/v1/quote_requests?select=id,name,email,phone,product_name,quantity,message,status,deal_value,created_at&order=created_at.desc&limit=50`;

    if (authUser && !isAdminUser(authUser) && authUser.email) {
      url += `&email=ilike.${encodeURIComponent(authUser.email.trim().toLowerCase())}`;
    } else if (!authUser) {
      url += `&phone=ilike.*${encodeURIComponent(cleanPhone)}`;
    }

    const dbRes = await fetch(url, { headers });
    if (!dbRes.ok) {
      return res.status(dbRes.status).json({ error: 'Database query failed', orders: [] });
    }

    const rows = (await dbRes.json()) as Array<{
      id: number;
      name?: string;
      email?: string;
      phone?: string;
      product_name?: string;
      quantity?: number;
      message?: string;
      status?: string;
      deal_value?: number;
      created_at?: string;
    }>;

    const filtered = rows.filter((row) => {
      if (authUser && isAdminUser(authUser)) return true;
      if (authUser && authUser.email) {
        const emailMatch =
          (row.email || '').trim().toLowerCase() === authUser.email.trim().toLowerCase();
        if (!cleanRef) return emailMatch;
        const text = `${row.product_name || ''} ${row.message || ''} ${row.id}`.toLowerCase();
        return emailMatch && text.includes(cleanRef);
      }
      // Guest verification: BOTH ref AND phone must match
      const rowPhone = (row.phone || '').replace(/[^0-9]/g, '');
      const text = `${row.product_name || ''} ${row.message || ''} ${row.id}`.toLowerCase();
      return rowPhone.endsWith(cleanPhone) && text.includes(cleanRef);
    });

    return res.status(200).json({ orders: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Order lookup failed';
    return res.status(500).json({ error: message, orders: [] });
  }
}
