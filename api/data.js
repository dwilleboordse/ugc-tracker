export default async function handler(req, res) {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({
      error: 'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN'
    });
  }

  const KEY = 'ugc-tracker-data';

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${UPSTASH_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(["GET", KEY]),
      });
      const json = await response.json();
      if (json.result) {
        let parsed = JSON.parse(json.result);
        // Fix old corrupted data: if result is an array with a string, unwrap it
        if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
          parsed = JSON.parse(parsed[0]);
        }
        // Ensure correct shape
        if (!parsed.clients) parsed.clients = [];
        if (!parsed.concepts) parsed.concepts = [];
        return res.status(200).json(parsed);
      }
      return res.status(200).json({ clients: [], concepts: [] });
    } catch (e) {
      return res.status(500).json({ error: 'Database read failed: ' + e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const value = JSON.stringify(req.body);
      const response = await fetch(`${UPSTASH_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(["SET", KEY, value]),
      });
      const json = await response.json();
      if (json.result === 'OK') {
        return res.status(200).json({ ok: true });
      }
      return res.status(500).json({ error: 'Write failed', detail: json });
    } catch (e) {
      return res.status(500).json({ error: 'Database write failed: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
