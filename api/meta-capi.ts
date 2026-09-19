import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function hashSha256(str: string): string {
  const clean = str.trim().toLowerCase();
  if (!clean) return '';
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventName, eventId, email, phone, value, currency, customData } = req.body || {};

  if (!eventName) {
    return res.status(400).json({ error: 'Missing eventName' });
  }

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!token || !pixelId) {
    // Graceful return if CAPI token is not configured on server
    return res.status(200).json({ success: true, message: 'CAPI token not configured on server; event logged' });
  }

  try {
    const hashedEmail = email ? hashSha256(email) : undefined;
    const hashedPhone = phone ? hashSha256(phone.replace(/[^0-9]/g, '')) : undefined;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          action_source: 'website',
          user_data: {
            em: hashedEmail ? [hashedEmail] : [],
            ph: hashedPhone ? [hashedPhone] : [],
            client_user_agent: req.headers['user-agent'] || '',
            client_ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || ''
          },
          custom_data: {
            currency: currency || 'MAD',
            value: value || 0,
            ...customData
          }
        }
      ]
    };

    const fbRes = await fetch(`https://graph.facebook.net/v19.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await fbRes.json();
    return res.status(fbRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({ error: message });
  }
}
