// GET /api/deliver?session_id=xxx — Stripe success redirect handler
// Verifies payment, generates PDF, emails to client, marks as released

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const { deliverDocument } = require('./email-util');

const SERVICE_LABELS = {
  will: 'Online Will Kit', demand: 'Letter of Demand', eligibility: 'Visa Eligibility Report',
  skills: 'Skills Assessment Application', abn: 'ABN & Business Registration',
  'employment-contract': 'Employment Contract', prenup: 'Prenuptial Agreement (BFA)',
  separation: 'Separation Agreement', 'stat-dec': 'Statutory Declaration',
  'contract-review': 'Commercial Contract Review', consultation: 'Consultation Booking Confirmed',
  'character-reference': 'Character Reference Letter',
};

function successPage(name, service) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Payment confirmed - Bourne Law</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f0f2f7;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:12px;padding:40px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font-size:22px;color:#0f2654;margin:0 0 12px}
    p{color:#555;font-size:14px;line-height:1.6;margin:0 0 12px}
    a{color:#0f2654;text-decoration:none;font-weight:600}
    .footer{margin-top:24px;font-size:12px;color:#aaa}
  </style></head><body>
  <div class="card">
    <div class="icon">&#x2705;</div>
    <h1>Payment confirmed</h1>
    <p>Thank you${name ? ', ' + name : ''}. Your payment for <strong>${service}</strong> has been received.</p>
    <p>Your document has been emailed to you as a <strong>PDF attachment</strong>. Please check your inbox (and spam folder if needed).</p>
    <p>Questions? Contact <a href="mailto:dimitri@bournelaw.com.au">dimitri@bournelaw.com.au</a> or call 0402 266 989.</p>
    <div class="footer">Bourne Law - Solicitors &amp; Migration Agents - LPN 5511816</div>
  </div></body></html>`;
}

function alreadyDeliveredPage() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Already delivered - Bourne Law</title>
  <style>body{font-family:Arial,sans-serif;background:#f0f2f7;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}.card{background:#fff;border-radius:12px;padding:40px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}h1{font-size:22px;color:#0f2654;margin:0 0 12px}p{color:#555;font-size:14px;line-height:1.6;margin:0 0 12px}a{color:#0f2654;font-weight:600}</style></head><body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px">&#x1F4EC;</div>
    <h1>Document already delivered</h1>
    <p>Your PDF was previously emailed. Please check your inbox.</p>
    <p>Need another copy? Contact <a href="mailto:dimitri@bournelaw.com.au">dimitri@bournelaw.com.au</a>.</p>
  </div></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const sessionId = req.query && req.query.session_id;
  if (!sessionId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Invalid link</h1>');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    console.error('Stripe session retrieve error:', e.message);
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Invalid session</h1>');
  }

  if (session.payment_status !== 'paid') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(402).send('<h1>Payment not completed</h1>');
  }

  const submissionId = session.metadata && session.metadata.submission_id;
  if (!submissionId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Reference error - contact dimitri@bournelaw.com.au</h1>');
  }

  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', submissionId).single();
  if (fetchErr || !sub) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(404).send('<h1>Not found</h1>');
  }

  const serviceLabel = sub.service_label || SERVICE_LABELS[sub.service] || sub.service;

  if (sub.status === 'released') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(alreadyDeliveredPage());
  }

  try {
    await deliverDocument(sub);
  } catch (e) {
    console.error('Delivery error:', e.message);
  }

  await supabase.from('submissions').update({
    status: 'released',
    payment_status: 'paid',
    released_at: new Date().toISOString(),
  }).eq('id', submissionId);

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(successPage(sub.client_name, serviceLabel));
};
