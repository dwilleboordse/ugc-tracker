export default async function handler(req, res) {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({
      error: 'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in Vercel environment variables'
    });
  }

  const KEY = 'ugc-tracker-data';

  // GET = read data
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${UPSTASH_URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      const json = await response.json();
      if (json.result) {
        return res.status(200).json(JSON.parse(json.result));
      }
      return res.status(200).json({ clients: [], concepts: [] });
    } catch (e) {
      return res.status(500).json({ error: 'Database read failed: ' + e.message });
    }
  }

  // POST = write data
  if (req.method === 'POST') {
    try {
      const body = JSON.stringify(req.body);
      const response = await fetch(`${UPSTASH_URL}/set/${KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([body]),
      });
      const json = await response.json();
      if (json.result === 'OK') {
        return res.status(200).json({ ok: true });
      }
      return res.status(500).json({ error: 'Database write failed', detail: json });
    } catch (e) {
      return res.status(500).json({ error: 'Database write failed: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
