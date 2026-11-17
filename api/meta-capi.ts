import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Search',
  'AddToCart',
  'InitiateCheckout',
  'Lead',
  'Purchase',
  'Contact',
]);
const ALLOWED_CURRENCIES = new Set(['MAD', 'USD', 'EUR']);

// Simple in-memory per-IP rate limit (30 events / 60s per instance)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 30;
}

function hashSha256(str: string): string {
  const clean = str.trim().toLowerCase();
  if (!clean) return '';
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { eventName, eventId, email, phone, value, currency, customData } = req.body || {};

  if (typeof eventName !== 'string' || !ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ error: 'Invalid or unsupported eventName' });
  }

  const numericValue = value === undefined || value === null ? 0 : Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 5_000_000) {
    return res.status(400).json({ error: 'Invalid event value' });
  }

  const safeCurrency =
    typeof currency === 'string' && ALLOWED_CURRENCIES.has(currency.toUpperCase())
      ? currency.toUpperCase()
      : 'MAD';

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!token || !pixelId) {
    return res.status(200).json({ success: true, message: 'CAPI token not configured on server; event logged' });
  }

  try {
    const hashedEmail = typeof email === 'string' && email ? hashSha256(email) : undefined;
    const hashedPhone =
      typeof phone === 'string' && phone ? hashSha256(phone.replace(/[^0-9]/g, '')) : undefined;

    const safeCustomData: Record<string, string | number | boolean> = {};
    if (customData && typeof customData === 'object' && !Array.isArray(customData)) {
      for (const [k, v] of Object.entries(customData).slice(0, 10)) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          safeCustomData[k.slice(0, 40)] = typeof v === 'string' ? v.slice(0, 200) : v;
        }
      }
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id:
            typeof eventId === 'string' && eventId.length <= 80
              ? eventId
              : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          action_source: 'website',
          user_data: {
            em: hashedEmail ? [hashedEmail] : [],
            ph: hashedPhone ? [hashedPhone] : [],
            client_user_agent: req.headers['user-agent'] || '',
            client_ip_address: clientIp,
          },
          custom_data: {
            currency: safeCurrency,
            value: numericValue,
            ...safeCustomData,
          },
        },
      ],
    };

    const fbRes = await fetch(`https://graph.facebook.net/v19.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await fbRes.json();
    return res.status(fbRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Meta CAPI error';
    return res.status(500).json({ error: message });
  }
}
