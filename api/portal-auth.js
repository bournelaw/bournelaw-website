// POST /api/portal-auth — verify portal password
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  const correct = process.env.PORTAL_PASSWORD;

  if (!correct) return res.status(500).json({ error: 'Portal password not configured' });
  if (!password || password !== correct) return res.status(401).json({ error: 'Incorrect password' });

  // Return the password itself as the token (checked on every request)
  return res.json({ success: true, token: password });
};
