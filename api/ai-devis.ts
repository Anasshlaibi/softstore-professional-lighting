import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAdminRequest } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyAdminRequest(req);
  if (auth.ok === false) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const { contents, generationConfig } = req.body || {};
  if (!Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: 'Missing contents payload' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: generationConfig || { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await geminiRes.json();
    return res.status(geminiRes.status).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini request failed';
    return res.status(500).json({ error: message });
  }
}
