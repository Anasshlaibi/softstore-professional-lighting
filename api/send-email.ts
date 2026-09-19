import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { from, to, subject, html } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: from || 'GearShop Maroc <contact@gearshop.ma>',
        to,
        subject,
        html
      })
    });

    const data = await resendRes.json();
    return res.status(resendRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return res.status(500).json({ error: message });
  }
}
