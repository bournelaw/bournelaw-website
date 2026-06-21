// POST /api/stripe-webhook — Stripe webhook handler
// Listens for checkout.session.completed -> generates PDF, emails to client

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const { deliverDocument } = require('./email-util');

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
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
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.warn('STRIPE_WEBHOOK_SECRET not set - skipping signature verification');
    }
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: true });
  }

  const session = event.data.object;
  const submissionId = session.metadata && session.metadata.submission_id;

  if (!submissionId) {
    console.error('No submission_id in session metadata');
    return res.status(200).json({ received: true, error: 'No submission_id' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', submissionId).single();
  if (fetchErr || !sub) {
    console.error('Submission not found:', submissionId, fetchErr);
    return res.status(200).json({ received: true, error: 'Submission not found' });
  }

  if (sub.status === 'released') {
    console.log('Already released, skipping:', submissionId);
    return res.status(200).json({ received: true, already_released: true });
  }

  try {
    await deliverDocument(sub);
  } catch (e) {
    console.error('Document delivery error:', e.message);
  }

  await supabase.from('submissions').update({
    status: 'released',
    payment_status: 'paid',
    released_at: new Date().toISOString(),
  }).eq('id', submissionId);

  return res.status(200).json({ received: true, delivered: true });
};
