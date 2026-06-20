// ─── STRIPE CONFIG ─────────────────────────────────────────────────────────────
// Replace with your actual Stripe publishable key from https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_live_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY';

// ─── MOBILE MENU ───────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

// ─── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── VISA ENQUIRY BUTTONS → PRE-FILL FORM ──────────────────────────────────────
document.querySelectorAll('.visa-btn[data-visa]').forEach(btn => {
  btn.addEventListener('click', e => {
    const visaType = btn.getAttribute('data-visa');
    const select = document.getElementById('visa-select');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === visaType || select.options[i].value === visaType) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  });
});

// ─── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── ENQUIRY FORM ──────────────────────────────────────────────────────────────
const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = enquiryForm.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch(enquiryForm.action, {
        method: 'POST',
        body: new FormData(enquiryForm),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        showToast('Enquiry sent — we'll respond within one business day.');
        enquiryForm.reset();
      } else {
        showToast('Something went wrong. Please email dimitri@bournelaw.com.au');
      }
    } catch {
      showToast('Could not send. Please email dimitri@bournelaw.com.au');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send enquiry →';
    }
  });
}

// ─── STRIPE PAYMENT ────────────────────────────────────────────────────────────
let stripe, cardElement;

function initStripe() {
  if (typeof Stripe === 'undefined') return;
  stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const elements = stripe.elements();
  cardElement = elements.create('card', {
    style: {
      base: { fontSize: '14px', color: '#1a1a2e', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', '::placeholder': { color: '#aab' } },
      invalid: { color: '#c0392b' }
    }
  });
  const mountEl = document.getElementById('card-element');
  if (mountEl) cardElement.mount('#card-element');

  cardElement.on('change', e => {
    const el = document.getElementById('card-errors');
    if (el) el.textContent = e.error ? e.error.message : '';
  });
}

const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
  paymentForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!stripe || !cardElement) { showToast('Stripe is not configured yet.'); return; }

    const btn = document.getElementById('pay-btn');
    btn.disabled = true;
    btn.textContent = 'Processing…';

    const invoice = document.getElementById('invoice-number').value.trim();
    const amount  = parseFloat(document.getElementById('payment-amount').value);
    const name    = document.getElementById('payer-name').value.trim();

    if (!invoice || !amount || !name) {
      showToast('Please fill in all payment fields.');
      btn.disabled = false; btn.textContent = 'Pay securely →';
      return;
    }

    // Create PaymentMethod
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name }
    });

    if (error) {
      document.getElementById('card-errors').textContent = error.message;
      btn.disabled = false; btn.textContent = 'Pay securely →';
      return;
    }

    // Send to your backend (Vercel serverless function)
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: Math.round(amount * 100), // cents
          currency: 'aud',
          description: `Bourne Law Invoice #${invoice}`,
          name
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment of $${amount.toFixed(2)} received. Reference: ${invoice}`);
        paymentForm.reset();
        cardElement.clear();
      } else {
        document.getElementById('card-errors').textContent = data.error || 'Payment failed.';
      }
    } catch {
      document.getElementById('card-errors').textContent = 'Network error. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Pay securely →';
    }
  });
}

// Init Stripe after DOM ready
window.addEventListener('load', initStripe);
