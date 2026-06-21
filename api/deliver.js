// GET /api/deliver?session_id=xxx — Stripe success redirect handler
// Verifies payment was successful, emails document to client, marks as released
// Called when client is redirected back from Stripe Checkout after successful payment

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const Stripe = require('stripe');

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
  'character-reference': 'Character Reference Letter',
};

function successPage(name, service) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Payment confirmed — Bourne Law</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f0f2f7;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:12px;padding:40px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font-size:22px;color:#0f2654;margin:0 0 12px}
    p{color:#555;font-size:14px;line-height:1.6;margin:0 0 12px}
    a{color:#0f2654;text-decoration:none;font-weight:600}
    .footer{margin-top:24px;font-size:12px;color:#aaa}
  </style></head><body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Payment confirmed</h1>
    <p>Thank you${name ? ', ' + name : ''}. Your payment for <strong>${service}</strong> has been received.</p>
    <p>Your document has been emailed to you. Please check your inbox (and spam folder if needed).</p>
    <p>If you have any questions, contact <a href="mailto:dimitri@bournelaw.com.au">dimitri@bournelaw.com.au</a> or call 0402 266 989.</p>
    <div class="footer">Bourne Law · Solicitors &amp; Migration Agents · LPN 5511816</div>
  </div>
  </body></html>`;
}

function alreadyDeliveredPage() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Already delivered — Bourne Law</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f0f2f7;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#fff;border-radius:12px;padding:40px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center}
    h1{font-size:22px;color:#0f2654;margin:0 0 12px}
    p{color:#555;font-size:14px;line-height:1.6;margin:0 0 12px}
    a{color:#0f2654;font-weight:600}
  </style></head><body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px">📬</div>
    <h1>Document already delivered</h1>
    <p>Your document was previously emailed. Please check your inbox.</p>
    <p>Need a copy? Contact <a href="mailto:dimitri@bournelaw.com.au">dimitri@bournelaw.com.au</a>.</p>
  </div></body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const sessionId = req.query?.session_id;
  if (!sessionId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Invalid link</h1>');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Verify payment with Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    console.error('Stripe session retrieve error:', e);
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Invalid session</h1>');
  }

  if (session.payment_status !== 'paid') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(402).send('<h1>Payment not completed</h1><p>Please complete payment to receive your document.</p>');
  }

  const submissionId = session.metadata?.submission_id;
  if (!submissionId) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send('<h1>Reference error</h1><p>Please contact dimitri@bournelaw.com.au</p>');
  }

  // Fetch submission
  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', submissionId).single();
  if (fetchErr || !sub) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(404).send('<h1>Not found</h1>');
  }

  const serviceLabel = sub.service_label || SERVICE_LABELS[sub.service] || sub.service;

  // Already released — show "already delivered" page (idempotency)
  if (sub.status === 'released') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(alreadyDeliveredPage());
  }

  // Deliver document via email
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
              <strong style="font-size:16px">Bourne Law — Payment confirmed, document enclosed</strong>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
              <p style="font-size:14px;margin:0 0 12px">Dear ${sub.client_name || 'Client'},</p>
              <p style="font-size:14px;margin:0 0 16px">Thank you — payment has been received. Your <strong>${serviceLabel}</strong>, reviewed and approved by Dimitri Bourne, is enclosed below.</p>
              ${sub.solicitor_notes ? `<p style="font-size:14px;background:#f7f8fc;padding:12px 16px;border-left:3px solid #0f2654;margin:0 0 20px"><strong>Note from Dimitri:</strong><br>${sub.solicitor_notes.replace(/\n/g,'<br>')}</p>` : ''}
              <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
              ${sub.draft_html || '<p>Document not available. Please contact us.</p>'}
              <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:12px;color:#888;margin:0 0 6px">Bourne Law · PO Box 6286, Gold Coast Mail Centre QLD 9726 · dimitri@bournelaw.com.au · 0402 266 989</p>
              <p style="font-size:11px;color:#aaa;margin:0">This document has been prepared by Dimitri Bourne, Solicitor and MARA Registered Migration Agent LPN 5511816.</p>
            </div>
          </div>`,
      });
    } catch (e) {
      console.error('Email delivery error:', e);
    }
  }

  // Mark as released in Supabase
  await supabase.from('submissions').update({
    status: 'released',
    payment_status: 'paid',
    released_at: new Date().toISOString(),
  }).eq('id', submissionId);

  // Show success page
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(successPage(sub.client_name, serviceLabel));
};
