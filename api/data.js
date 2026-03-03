import { kv } from '@vercel/kv';

const DATA_KEY = 'ugc-tracker-data';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await kv.get(DATA_KEY);
      return res.status(200).json(data || { clients: [], concepts: [] });
    } catch (e) {
      return res.status(200).json({ clients: [], concepts: [] });
    }
  }

  if (req.method === 'POST') {
    try {
      await kv.set(DATA_KEY, req.body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Database not connected' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
