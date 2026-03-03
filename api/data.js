import { kv } from '@vercel/kv';

const DATA_KEY = 'ugc-tracker-data';

export default async function handler(req, res) {
  // GET = read data (public, for share links + manager)
  if (req.method === 'GET') {
    try {
      const data = await kv.get(DATA_KEY);
      return res.status(200).json(data || { clients: [], concepts: [] });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load data' });
    }
  }

  // POST = write data (requires manager PIN)
  if (req.method === 'POST') {
    const pin = req.headers['x-manager-pin'];
    const correctPin = process.env.MANAGER_PIN;

    if (!correctPin) {
      return res.status(500).json({ error: 'MANAGER_PIN not configured in environment variables' });
    }

    if (pin !== correctPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    try {
      await kv.set(DATA_KEY, req.body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
