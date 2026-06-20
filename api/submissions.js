// GET /api/submissions         — list all submissions [v1781995686]
// GET /api/submissions?id=uuid — get single submission with draft HTML

const { createClient } = require('@supabase/supabase-js');

function auth(req) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '').trim();
  return token && token === process.env.PORTAL_PASSWORD;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorised' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { id } = req.query;

  if (id) {
    const { data, error } = await supabase.from('submissions').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    return res.json(data);
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('id, service, service_label, client_name, client_email, status, created_at, released_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
};
