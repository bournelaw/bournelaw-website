// POST /api/release — approve and send document to client
// Body: { id, notes }

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

function auth(req) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '').trim();
  return token && token === process.env.PORTAL_PASSWORD;
}

const SERVICE_LABELS = {
  will: 'Online Will Kit',
  demand: 'Letter of Demand',
  eligibility: 'Visa Eligibility Report',
  skills: 'Skills Assessment Application',
  abn: 'ABN & Business Registration',
  'employment-contract': 'Employment Contract',
  prenup: 'Prenuptial Agreement (BFA)',
  separation: 'Separation Agreement',
  'stat-dec': 'Statutory Declaration',
  'contract-review': 'Commercial Contract Review',
  consultation: 'Consultation Booking Confirmed',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorised' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, notes, edited_html } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Fetch submission
  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', id).single();
  if (fetchErr || !sub) return res.status(404).json({ error: 'Submission not found' });

  const finalHtml = edited_html || sub.draft_html;
  const serviceLabel = sub.service_label || SERVICE_LABELS[sub.service] || sub.service;

  // Send to client via Resend
  if (process.env.RESEND_API_KEY && sub.client_email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Bourne Law <dimitri@bournelaw.com.au>',
        to: sub.client_email,
        subject: `Your ${serviceLabel} — Bourne Law`,
        html: `
          <div style="font-family:sans-serif;max-width:620px;margin:0 auto;padding:24px">
            <div style="background:#0f2654;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
              <strong style="font-size:16px">Bourne Law — Your document is ready</strong>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
              <p style="font-size:14px">Dear ${sub.client_name},</p>
              <p style="font-size:14px">Your <strong>${serviceLabel}</strong> has been reviewed and approved by Dimitri Bourne and is enclosed below.</p>
              ${notes ? `<p style="font-size:14px;background:#f7f8fc;padding:12px;border-left:3px solid #0f2654"><strong>Note from Dimitri:</strong><br>${notes.replace(/\n/g,'<br>')}</p>` : ''}
              <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
              ${finalHtml}
              <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:12px;color:#888">Bourne Law · PO Box 6286, Gold Coast Mail Centre QLD 9726 · dimitri@bournelaw.com.au · 0402 266 989</p>
              <p style="font-size:11px;color:#aaa">This document has been prepared by Dimitri Bourne, Solicitor and MARA Registered Migration Agent LPN 5511816. It does not constitute legal advice in general and is prepared specifically for your matter.</p>
            </div>
          </div>`,
      });
    } catch (e) {
      console.error('Resend error:', e);
      return res.status(500).json({ error: 'Email send failed: ' + e.message });
    }
  }

  // Update status in Supabase
  await supabase.from('submissions').update({
    status: 'released',
    solicitor_notes: notes || null,
    draft_html: finalHtml,
    released_at: new Date().toISOString(),
  }).eq('id', id);

  return res.json({ success: true });
};
