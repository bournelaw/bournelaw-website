// POST /api/release — approve matter, create Stripe Checkout session, email payment link to client
// New flow: Dimitri sets fee → client receives payment link → pays → /api/stripe-webhook delivers document

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const Stripe = require('stripe');

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
  'character-reference': 'Character Reference Letter',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorised' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, notes, edited_html, fee_amount } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });
  if (!fee_amount || isNaN(parseFloat(fee_amount)) || parseFloat(fee_amount) <= 0) {
    return res.status(400).json({ error: 'A valid fee amount is required before releasing.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Fetch submission
  const { data: sub, error: fetchErr } = await supabase.from('submissions').select('*').eq('id', id).single();
  if (fetchErr || !sub) return res.status(404).json({ error: 'Submission not found' });
  if (sub.status === 'released') return res.status(400).json({ error: 'This matter has already been released.' });

  const finalHtml = edited_html || sub.draft_html;
  const serviceLabel = sub.service_label || SERVICE_LABELS[sub.service] || sub.service;
  const feeInCents = Math.round(parseFloat(fee_amount) * 100);

  // Create Stripe Checkout session
  let paymentUrl = null;
  let stripeSessionId = null;

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'aud',
            product_data: {
              name: serviceLabel,
              description: `Bourne Law — prepared by Dimitri Bourne, Solicitor & Migration Agent`,
            },
            unit_amount: feeInCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: sub.client_email || undefined,
        success_url: `https://bournelaw.com.au/api/deliver?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://bournelaw.com.au`,
        metadata: {
          submission_id: id,
          client_name: sub.client_name || '',
          service_label: serviceLabel,
        },
      });
      paymentUrl = session.url;
      stripeSessionId = session.id;
    } catch (e) {
      console.error('Stripe error:', e);
      return res.status(500).json({ error: 'Failed to create payment session: ' + e.message });
    }
  }

  // Save approved document + payment details to Supabase
  const updatePayload = {
    status: 'awaiting_payment',
    solicitor_notes: notes || null,
    draft_html: finalHtml,
    fee_amount: parseFloat(fee_amount),
    payment_status: 'unpaid',
  };
  if (stripeSessionId) updatePayload.stripe_session_id = stripeSessionId;
  if (paymentUrl) updatePayload.payment_url = paymentUrl;

  const { error: updateErr } = await supabase.from('submissions').update(updatePayload).eq('id', id);
  if (updateErr) console.error('Supabase update error:', updateErr);

  // Email client the payment link
  if (process.env.RESEND_API_KEY && sub.client_email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Bourne Law <dimitri@bournelaw.com.au>',
        to: sub.client_email,
        subject: `Your ${serviceLabel} is ready — payment required`,
        html: `
          <div style="font-family:sans-serif;max-width:620px;margin:0 auto;padding:24px">
            <div style="background:#0f2654;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
              <strong style="font-size:16px">Bourne Law — Your document is ready</strong>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
              <p style="font-size:14px;margin:0 0 12px">Dear ${sub.client_name || 'Client'},</p>
              <p style="font-size:14px;margin:0 0 12px">Your <strong>${serviceLabel}</strong> has been reviewed and approved by Dimitri Bourne and is ready for delivery.</p>
              <p style="font-size:14px;margin:0 0 12px">To receive your document, please complete payment of <strong>$${parseFloat(fee_amount).toFixed(2)} AUD</strong> using the button below:</p>
              ${notes ? `<p style="font-size:14px;background:#f7f8fc;padding:12px 16px;border-left:3px solid #0f2654;margin:0 0 20px"><strong>Note from Dimitri:</strong><br>${notes.replace(/\n/g,'<br>')}</p>` : ''}
              <div style="text-align:center;margin:28px 0">
                <a href="${paymentUrl || '#'}" style="background:#0f2654;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;display:inline-block">Pay $${parseFloat(fee_amount).toFixed(2)} &amp; receive document →</a>
              </div>
              <p style="font-size:13px;color:#888;margin:0 0 8px">Payment is processed securely via Stripe. Your document will be emailed to you immediately upon confirmation.</p>
              <p style="font-size:13px;color:#888;margin:0">If you have any questions, contact us at <a href="mailto:dimitri@bournelaw.com.au" style="color:#0f2654">dimitri@bournelaw.com.au</a> or call 0402 266 989.</p>
              <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:11px;color:#aaa;margin:0">Bourne Law · PO Box 6286, Gold Coast Mail Centre QLD 9726 · LPN 5511816</p>
            </div>
          </div>`,
      });
    } catch (e) {
      console.error('Resend error:', e);
      // Don't fail the request — payment link was created, just log the email issue
    }
  }

  return res.json({ success: true, payment_url: paymentUrl, fee: parseFloat(fee_amount) });
};
