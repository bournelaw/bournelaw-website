const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { paymentMethodId, amount, currency, description, name } = req.body;
  if (!paymentMethodId || !amount || amount < 50) return res.status(400).json({ error: 'Invalid details' });
  try {
    const intent = await stripe.paymentIntents.create({
      amount, currency: currency || 'aud', payment_method: paymentMethodId,
      confirm: true, description, metadata: { payer_name: name },
      return_url: 'https://bournelaw.com.au/payment-success',
    });
    if (intent.status === 'succeeded') return res.json({ success: true, id: intent.id });
    return res.json({ success: false, error: 'Status: ' + intent.status });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
};
