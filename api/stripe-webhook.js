// POST /api/stripe-webhook — Stripe webhook handler
// Listens for checkout.session.completed → emails approved document to client

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

// Read raw request body from stream (required for Stripe signature verification)
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function deliverDocument(submission) {
  if (!process.env.RESEND_API_KEY || !submission.client_email) return;
  const serviceLabel = submission.service_label || SERVICE_LABELS[submission.service] || submission.service;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Bourne Law <dimitri@bournelaw.com.au>',
    to: submission.client_email,
    subject: `Your ${serviceLabel} — Bourne Law`,
    html: `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;padding:24px">
        <div style="background:#0f2654;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
          <strong style="font-size:16px">Bourne Law — Payment confirmed, document enclosed</strong>
        </div>
        <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p style="font-size:14px;margin:0 0 12px">Dear ${submission.client_name || 'Client'},</p>
          <p style="font-size:14px;margin:0 0 16px">Thank you — payment has been received. Your <strong>${serviceLabel}</strong>, reviewed and approved by Dimitri Bourne, is enclosed below.</p>
          ${submission.solicitor_notes ? `<p style="font-size:14px;background:#f7f8fc;padding:12px 16px;border-left:3px solid #0f2654;margin:0 0 20px"><strong>Note from Dimitri:</strong><br>${submission.solicitor_notes.replace(/\n/g,'<br>')}</p>` : ''}
          <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
          ${submission.draft_html || '<p>Document not available. Please contact us.</p>'}
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
          <p style="font-size:12px;color:#888;margin:0 0 6px">Bourne Law · PO Box 6286, Gold Coast Mail Centre QLD 9726 · dimitri@bournelaw.com.au · 0402 266 989</p>
          <p style="font-size:11px;color:#aaa;margin:0">This document has been prepared by Dimitri Bourne, Solicitor and MARA Registered Migration Agent LPN 5511816.</p>
        </div>
      </div>`,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // No webhook secret configured — parse body directly (less secure, dev only)
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
    }
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: true });
  }

  const session = event.data.object;
  const submissionId = session.metadata?.submission_id;

  if (!submissionId) {
    console.error('No submission_id in session metadata');
    return res.status(200).json({ received: true, error: 'No submission_id' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Fetch submission
  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', submissionId).single();
  if (fetchErr || !sub) {
    console.error('Submission not found:', submissionId, fetchErr);
    return res.status(200).json({ received: true, error: 'Submission not found' });
  }

  // Idempotency — don't re-deliver if already released
  if (sub.status === 'released') {
    console.log('Already released, skipping delivery:', submissionId);
    return res.status(200).json({ received: true, already_released: true });
  }

  // Deliver document
  try {
    await deliverDocument(sub);
  } catch (e) {
    console.error('Document delivery error:', e);
    // Update payment status even if email fails so we can retry
  }

  // Mark as released
  await supabase.from('submissions').update({
    status: 'released',
    payment_status: 'paid',
    released_at: new Date().toISOString(),
  }).eq('id', submissionId);

  return res.status(200).json({ received: true, delivered: true });
};
