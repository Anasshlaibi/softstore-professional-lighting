import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from './_lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAdminRequest(req);
  if (auth.ok === false) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { from, to, subject, html } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  const recipients = Array.isArray(to) ? to : [to];
  if (
    recipients.length === 0 ||
    recipients.length > 50 ||
    !recipients.every((r) => typeof r === 'string' && EMAIL_RE.test(r.trim()))
  ) {
    return res.status(400).json({ error: 'Invalid recipient email address(es)' });
  }

  if (typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 200) {
    return res.status(400).json({ error: 'Invalid subject length' });
  }

  if (typeof html !== 'string' || html.length > 100_000) {
    return res.status(400).json({ error: 'HTML content exceeds 100 KB limit' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured on server' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: from || 'GearShop Maroc <contact@gearshop.ma>',
        to: recipients,
        subject: subject.trim(),
        html,
      }),
    });

    const data = await resendRes.json();
    return res.status(resendRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return res.status(500).json({ error: message });
  }
}
