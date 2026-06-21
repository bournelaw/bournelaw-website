// Vercel Serverless Function — /api/intake
// Saves submission to Supabase, generates draft document, emails Dimitri via Resend

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { generateDocument } = require('./generate-doc');

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
  consultation: 'Initial Consultation Booking',
  'character-reference': 'Character Reference Letter',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;
  const serviceLabel = SERVICE_LABELS[data.service] || data.service;
  const clientName = data.full_name || data.your_name || data.employer_name || 'New Client';
  const clientEmail = data.email || data.your_email || '';
  const submittedAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' });

  // Generate draft document
  let draftHtml = '';
  try { draftHtml = generateDocument(data.service, data); } catch (e) { console.error('Doc gen error:', e); }

  // Save to Supabase
  let submissionId = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { data: row, error } = await supabase.from('submissions').insert({
        service: data.service,
        service_label: serviceLabel,
        client_name: clientName,
        client_email: clientEmail,
        data: data,
        status: 'pending',
        draft_html: draftHtml,
      }).select().single();
      if (error) console.error('Supabase error:', error);
      else submissionId = row?.id;
    } catch (e) { console.error('Supabase exception:', e); }
  }

  // Email Dimitri via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Bourne Law Portal <onboarding@resend.dev>',
        to: 'dimitri@bournelaw.com.au',
        subject: `[New matter] ${serviceLabel} — ${clientName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="background:#0f2654;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
              <strong style="font-size:16px">New matter received — Bourne Law Portal</strong>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;color:#555;width:140px">Service</td><td><strong>${serviceLabel}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#555">Client</td><td>${clientName}</td></tr>
                <tr><td style="padding:6px 0;color:#555">Email</td><td>${clientEmail}</td></tr>
                <tr><td style="padding:6px 0;color:#555">Submitted</td><td>${submittedAt}</td></tr>
                ${submissionId ? `<tr><td style="padding:6px 0;color:#555">Reference</td><td>${submissionId.slice(0,8).toUpperCase()}</td></tr>` : ''}
              </table>
              <div style="margin-top:20px">
                <a href="https://bournelaw.com.au/portal" style="background:#0f2654;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">Review &amp; approve in portal →</a>
              </div>
            </div>
          </div>`,
      });
    } catch (e) { console.error('Resend error:', e); }
  }

  return res.json({ success: true, id: submissionId });
};
