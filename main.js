// STRIPE CONFIG
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TkUflJRSvy7vrhHjr4DWgpZkAbf06NV2slkbQCVtTixFMladmNUpEDGFnEkSlkdEEJwkZedHfv0HDs4hVGCVXKs00NuUYHaBC';

const MODULE_FORMS = {

  consultation: {
    title: 'Book a Consultation',
    price: 350,
    priceLabel: '60-min solicitor consultation - any area of law or immigration',
    fields: [
      { name: 'full_name', label: 'Your full name', type: 'text', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
      { name: 'consult_type', label: 'Consultation topic', type: 'select', options: ['Immigration - visa options and pathways', 'Family law - separation / divorce / prenup', 'Employment law - dismissal / dispute', 'Litigation - civil dispute / debt recovery', 'Conveyancing - buying or selling property', 'Business and commercial law', 'Criminal and traffic law', 'Wills and estate planning', 'Other - general legal advice'] },
      { name: 'preferred_date', label: 'Preferred date (optional)', type: 'date', required: false },
      { name: 'preferred_time', label: 'Preferred time', type: 'select', options: ['Morning (9am-12pm)', 'Afternoon (12pm-3pm)', 'Late afternoon (3pm-5pm)', 'Any time'] },
      { name: 'consult_format', label: 'Format', type: 'select', options: ['Phone call', 'Video call (Teams/Zoom)', 'In person - Gold Coast'] },
      { name: 'summary', label: 'Brief summary of your situation', type: 'textarea', required: true, placeholder: 'e.g. I am on a student visa and my partner is Australian. I want to understand my partner visa options.' },
    ]
  },

  will: {
    title: 'Online Will Kit',
    price: 299,
    priceLabel: 'Simple will $299 - couples wills and POA $599',
    fields: [
      { name: 'full_name', label: 'Full legal name', type: 'text', required: true },
      { name: 'dob', label: 'Date of birth', type: 'date', required: true },
      { name: 'address', label: 'Residential address', type: 'text', required: true },
      { name: 'executor_name', label: 'Executor full name', type: 'text', required: true },
      { name: 'executor_relation', label: 'Executor relationship to you', type: 'text', required: true },
      { name: 'beneficiaries', label: 'Beneficiaries (name, relationship, % share)', type: 'textarea', required: true, placeholder: 'e.g. Jane Smith (wife) 100%' },
      { name: 'assets', label: 'Main assets (property, bank accounts, super, vehicles)', type: 'textarea', required: true, placeholder: 'e.g. Family home at 12 Smith St, ANZ bank account, Toyota Corolla 2020' },
      { name: 'guardian', label: 'Guardian for minor children (if applicable)', type: 'text', required: false, placeholder: 'Leave blank if not applicable' },
      { name: 'special_wishes', label: 'Special wishes or instructions (optional)', type: 'textarea', required: false },
      { name: 'couple', label: 'Is this for a couple? (add $300 for partners will and POA)', type: 'select', options: ['No - single will ($299)', 'Yes - couples wills and Enduring POA ($599)'] },
      { name: 'email', label: 'Your email address', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
    ]
  },

  demand: {
    title: 'Letter of Demand',
    price: 149,
    priceLabel: 'Fixed fee - solicitor-signed, sent same day',
    fields: [
      { name: 'your_name', label: 'Your full name / business name', type: 'text', required: true },
      { name: 'your_email', label: 'Your email', type: 'email', required: true },
      { name: 'your_phone', label: 'Your phone', type: 'tel', required: true },
      { name: 'debtor_name', label: 'Debtor full name / business name', type: 'text', required: true },
      { name: 'debtor_address', label: 'Debtor address', type: 'text', required: true },
      { name: 'amount_owed', label: 'Amount owed (AUD)', type: 'number', required: true },
      { name: 'debt_reason', label: 'Why is this money owed?', type: 'textarea', required: true, placeholder: 'e.g. Unpaid invoice for services rendered in March 2026' },
      { name: 'due_date', label: 'Original due date', type: 'date', required: true },
      { name: 'deadline', label: 'Deadline to pay (days from today)', type: 'select', options: ['7 days', '14 days', '21 days', '28 days'] },
      { name: 'previous_contact', label: 'Previous attempts to collect?', type: 'textarea', required: false, placeholder: 'e.g. Email sent 1 March, no response. Phone call 10 March, promised to pay, did not.' },
    ]
  },

  eligibility: {
    title: 'Visa Eligibility Report',
    price: 199,
    priceLabel: 'Full written report - all visa pathways assessed',
    fields: [
      { name: 'full_name', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'nationality', label: 'Country of citizenship', type: 'text', required: true },
      { name: 'dob', label: 'Date of birth', type: 'date', required: true },
      { name: 'current_visa', label: 'Current visa / immigration status in Australia', type: 'text', required: true, placeholder: 'e.g. Student visa 500, Tourist visa, Offshore' },
      { name: 'occupation', label: 'Current occupation / job title', type: 'text', required: true },
      { name: 'anzsco', label: 'ANZSCO code (if known)', type: 'text', required: false },
      { name: 'qualifications', label: 'Highest qualification', type: 'select', options: ['Doctorate (PhD)', 'Masters degree', 'Bachelor degree', 'Diploma / Advanced Diploma', 'Trade qualification', 'High school certificate', 'No formal qualification'] },
      { name: 'english', label: 'English proficiency', type: 'select', options: ['Native speaker', 'IELTS 8+ Superior', 'IELTS 7+ Proficient', 'IELTS 6+ Competent', 'IELTS below 6', 'Not tested yet'] },
      { name: 'work_experience', label: 'Years of skilled work experience', type: 'select', options: ['Less than 1 year', '1 to 3 years', '3 to 5 years', '5 to 8 years', '8+ years'] },
      { name: 'aus_experience', label: 'Years of Australian work experience', type: 'select', options: ['None', 'Less than 1 year', '1 to 3 years', '3 to 5 years', '5+ years'] },
      { name: 'sponsor', label: 'Do you have an Australian employer willing to sponsor you?', type: 'select', options: ['Yes', 'No', 'Possibly'] },
      { name: 'state_preference', label: 'Preferred state/territory', type: 'select', options: ['No preference', 'Queensland', 'New South Wales', 'Victoria', 'Western Australia', 'South Australia', 'Tasmania', 'ACT', 'Northern Territory'] },
      { name: 'partner', label: 'Do you have an Australian partner / spouse?', type: 'select', options: ['No', 'Yes - Australian citizen', 'Yes - Australian permanent resident'] },
      { name: 'previous_refusal', label: 'Any previous visa refusals or cancellations?', type: 'select', options: ['No', 'Yes - please explain in comments'] },
      { name: 'comments', label: 'Anything else we should know?', type: 'textarea', required: false },
    ]
  },

  skills: {
    title: 'Skills Assessment Application',
    price: 750,
    priceLabel: 'Full service - all assessment bodies',
    fields: [
      { name: 'full_name', label: 'Full name', type: 'text', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
      { name: 'nationality', label: 'Country of citizenship', type: 'text', required: true },
      { name: 'occupation', label: 'Nominated occupation', type: 'text', required: true },
      { name: 'assessment_body', label: 'Assessment body', type: 'select', options: ['Engineers Australia', 'VETASSESS', 'ACS (IT)', 'TRA (Trades)', 'AHPRA (Health)', 'AACA (Architecture)', 'Other / unsure'] },
      { name: 'qualification', label: 'Highest qualification (name, institution, year)', type: 'textarea', required: true },
      { name: 'work_history', label: 'Employment history (employer, role, dates)', type: 'textarea', required: true, placeholder: 'Most recent first. Include: employer name, job title, start date, end date, country.' },
      { name: 'has_docs', label: 'Documents you currently have', type: 'textarea', required: false, placeholder: 'e.g. Degree certificate, transcripts, employment letters, passport' },
      { name: 'comments', label: 'Additional information', type: 'textarea', required: false },
    ]
  },

  abn: {
    title: 'ABN and Business Registration',
    price: 99,
    priceLabel: 'ABN only $99 - Business name $149 - Pty Ltd $299',
    fields: [
      { name: 'service_type', label: 'What do you need?', type: 'select', options: ['ABN only ($99)', 'ABN + Business name registration ($149)', 'Company (Pty Ltd) setup ($299)', 'Full package - ABN + Name + Company ($349)'] },
      { name: 'full_name', label: 'Your full legal name', type: 'text', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
      { name: 'dob', label: 'Date of birth', type: 'date', required: true },
      { name: 'tax_file', label: 'Do you have a Tax File Number (TFN)?', type: 'select', options: ['Yes', 'No - I need to apply for one first'] },
      { name: 'business_name', label: 'Preferred business / company name', type: 'text', required: true },
      { name: 'business_activity', label: 'Main business activity', type: 'text', required: true, placeholder: 'e.g. Building and construction, IT consulting, Retail clothing' },
      { name: 'structure', label: 'Business structure', type: 'select', options: ['Sole trader', 'Partnership', 'Company (Pty Ltd)', 'Trust', 'Not sure'] },
      { name: 'address', label: 'Business address', type: 'text', required: true },
    ]
  },

  'employment-contract': {
    title: 'Employment Contract',
    price: 249,
    priceLabel: 'Award-compliant - solicitor reviewed',
    fields: [
      { name: 'employer_name', label: 'Employer / business name', type: 'text', required: true },
      { name: 'employer_abn', label: 'Employer ABN', type: 'text', required: true },
      { name: 'email', label: 'Your email address', type: 'email', required: true },
      { name: 'employee_name', label: 'Employee full name', type: 'text', required: true },
      { name: 'role', label: 'Job title / position', type: 'text', required: true },
      { name: 'employment_type', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Casual', 'Fixed term'] },
      { name: 'start_date', label: 'Start date', type: 'date', required: true },
      { name: 'salary', label: 'Annual salary or hourly rate', type: 'text', required: true, placeholder: 'e.g. $65,000 per year, or $28.50 per hour' },
      { name: 'hours', label: 'Hours per week', type: 'text', required: true },
      { name: 'location', label: 'Primary work location', type: 'text', required: true },
      { name: 'duties', label: 'Key duties and responsibilities', type: 'textarea', required: true },
      { name: 'probation', label: 'Probation period', type: 'select', options: ['No probation', '1 month', '3 months', '6 months'] },
      { name: 'award', label: 'Applicable modern award (if known)', type: 'text', required: false, placeholder: 'e.g. Clerks Award, Building Award - leave blank if unsure' },
      { name: 'special_conditions', label: 'Any special conditions or entitlements', type: 'textarea', required: false, placeholder: 'e.g. Vehicle allowance, work from home arrangements, bonus structure' },
    ]
  },

  prenup: {
    title: 'Prenuptial Agreement (BFA)',
    price: 599,
    priceLabel: 'Binding Financial Agreement - s90B Family Law Act',
    fields: [
      { name: 'your_name', label: 'Your full legal name', type: 'text', required: true },
      { name: 'your_email', label: 'Your email address', type: 'email', required: true },
      { name: 'your_phone', label: 'Your phone number', type: 'tel', required: true },
      { name: 'your_dob', label: 'Your date of birth', type: 'date', required: true },
      { name: 'partner_name', label: 'Partner full legal name', type: 'text', required: true },
      { name: 'partner_dob', label: 'Partner date of birth', type: 'date', required: true },
      { name: 'wedding_date', label: 'Planned wedding date (if known)', type: 'date', required: false },
      { name: 'your_assets', label: 'Your assets to protect (property, savings, business interests, super)', type: 'textarea', required: true, placeholder: 'e.g. Investment property at 12 Main St valued at $800k, ANZ savings $120k, 50% stake in ABC Pty Ltd' },
      { name: 'partner_assets', label: 'Partner assets (as best you know)', type: 'textarea', required: false, placeholder: 'e.g. None / house at 5 Oak St / car' },
      { name: 'debts', label: 'Any significant debts (yours or your partners)?', type: 'textarea', required: false, placeholder: 'e.g. Home loan $450k, credit card $8k' },
      { name: 'key_terms', label: 'Key terms you want in the agreement', type: 'textarea', required: true, placeholder: 'e.g. Keep pre-existing property separate. Shared assets acquired during marriage split 50/50.' },
      { name: 'comments', label: 'Any other context or instructions', type: 'textarea', required: false },
    ]
  },

  separation: {
    title: 'Separation Agreement',
    price: 799,
    priceLabel: 'Property division and financial agreement - solicitor certified',
    fields: [
      { name: 'your_name', label: 'Your full legal name', type: 'text', required: true },
      { name: 'your_email', label: 'Your email address', type: 'email', required: true },
      { name: 'your_phone', label: 'Your phone number', type: 'tel', required: true },
      { name: 'partner_name', label: 'Former partner full legal name', type: 'text', required: true },
      { name: 'relationship_type', label: 'Relationship type', type: 'select', options: ['Married', 'De facto'] },
      { name: 'separation_date', label: 'Date of separation', type: 'date', required: true },
      { name: 'children', label: 'Children from the relationship?', type: 'select', options: ['No children', 'Yes - we have children under 18', 'Yes - all children are adults'] },
      { name: 'property_list', label: 'Shared property and assets (list all)', type: 'textarea', required: true, placeholder: 'e.g. Family home at 12 Smith St (est. $850k), joint savings account ($45k), Toyota Camry 2022, super funds' },
      { name: 'proposed_split', label: 'Proposed division (what each party keeps)', type: 'textarea', required: true, placeholder: 'e.g. I keep the house and take on the mortgage. Partner keeps car and $20k savings.' },
      { name: 'debts', label: 'Shared debts and who is responsible for each', type: 'textarea', required: false, placeholder: 'e.g. Home loan $500k - I take it. Credit card $5k - partner takes it.' },
      { name: 'consent_orders', label: 'Do you want consent orders filed with the court?', type: 'select', options: ['Yes - file consent orders (recommended)', 'No - financial agreement only', 'Not sure - advise me'] },
      { name: 'comments', label: 'Any other context or special arrangements', type: 'textarea', required: false },
    ]
  },

  'stat-dec': {
    title: 'Statutory Declaration',
    price: 49,
    priceLabel: 'Same day - Commonwealth or QLD form',
    fields: [
      { name: 'full_name', label: 'Your full legal name', type: 'text', required: true },
      { name: 'email', label: 'Your email address', type: 'email', required: true },
      { name: 'phone', label: 'Your phone number', type: 'tel', required: true },
      { name: 'form_type', label: 'Which form do you need?', type: 'select', options: ['Commonwealth Statutory Declaration', 'Queensland Statutory Declaration', 'Not sure - advise me'] },
      { name: 'purpose', label: 'Purpose of the statutory declaration', type: 'text', required: true, placeholder: 'e.g. Immigration purposes, change of name, lost documents, character reference' },
      { name: 'declaration_content', label: 'What do you need to declare? (write in plain English)', type: 'textarea', required: true, placeholder: 'e.g. I declare that I have been known by two names - John Smith and John A. Smith - and that these refer to the same person.' },
      { name: 'supporting_docs', label: 'Any supporting documents or references to include?', type: 'textarea', required: false, placeholder: 'Leave blank if none' },
      { name: 'urgency', label: 'How urgent is this?', type: 'select', options: ['Same day (within hours)', 'By end of business today', 'Within 24 hours', 'Within 48 hours'] },
    ]
  },

  'contract-review': {
    title: 'Commercial Contract Review',
    price: 349,
    priceLabel: 'Up to 10 pages $349 - 10 to 30 pages $549',
    fields: [
      { name: 'your_name', label: 'Your full name / business name', type: 'text', required: true },
      { name: 'email', label: 'Your email address', type: 'email', required: true },
      { name: 'phone', label: 'Your phone number', type: 'tel', required: true },
      { name: 'contract_type', label: 'Type of contract', type: 'select', options: ['Service agreement', 'Supply agreement', 'Partnership / shareholder agreement', 'Franchise agreement', 'Lease / rental agreement', 'Employment contract', 'Business purchase agreement', 'Non-disclosure agreement (NDA)', 'Other'] },
      { name: 'contract_pages', label: 'Approximate number of pages', type: 'select', options: ['1 to 5 pages ($349)', '6 to 10 pages ($349)', '11 to 20 pages ($549)', '21 to 30 pages ($549)', '30+ pages - contact us for a quote'] },
      { name: 'your_role', label: 'Your role in this contract', type: 'select', options: ['Buyer / recipient of services', 'Seller / provider of services', 'Employer', 'Employee', 'Landlord', 'Tenant', 'Partner / shareholder', 'Other'] },
      { name: 'key_concerns', label: 'What are your main concerns or what should we focus on?', type: 'textarea', required: true, placeholder: 'e.g. Liability clauses, termination rights, payment terms, IP ownership, non-compete restrictions' },
      { name: 'contract_value', label: 'Approximate value of this contract', type: 'text', required: false, placeholder: 'e.g. $50,000 annual, $250,000 one-off' },
      { name: 'sign_deadline', label: 'When do you need to sign by?', type: 'date', required: false },
      { name: 'upload_note', label: 'After payment, email the contract to dimitri@bournelaw.com.au with your order reference', type: 'select', options: ['Understood - I will email the contract after payment'] },
    ]
  }

};

// MODULE MODAL

function openModule(type) {
  var cfg = MODULE_FORMS[type];
  if (!cfg) return;
  document.getElementById('modal-service-title').textContent = cfg.title;
  var container = document.getElementById('module-form-container');

  var html = '<form class="module-form" id="module-form" data-type="' + type + '" data-price="' + cfg.price + '">';
  html += '<div class="module-price-box"><div><div class="price-label">Service fee</div><div class="price">$' + cfg.price + ' AUD</div></div><div style="font-size:12px;color:var(--text-muted);text-align:right;max-width:200px">' + cfg.priceLabel + '</div></div>';

  cfg.fields.forEach(function(f) {
    var optLabel = f.required ? '' : ' <span style="color:var(--text-muted);font-weight:400">(optional)</span>';
    html += '<div class="form-group"><label>' + f.label + optLabel + '</label>';
    if (f.type === 'textarea') {
      html += '<textarea name="' + f.name + '" rows="3" ' + (f.required ? 'required' : '') + ' placeholder="' + (f.placeholder || '') + '"></textarea>';
    } else if (f.type === 'select') {
      html += '<select name="' + f.name + '" ' + (f.required ? 'required' : '') + '>' + f.options.map(function(o){ return '<option value="' + o + '">' + o + '</option>'; }).join('') + '</select>';
    } else {
      html += '<input type="' + f.type + '" name="' + f.name + '" ' + (f.required ? 'required' : '') + ' placeholder="' + (f.placeholder || '') + '">';
    }
    html += '</div>';
  });

  html += '<div class="form-group"><label>Debit or credit card</label>';
  html += '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Enter your Visa, Mastercard or AMEX - card number, expiry and CVC in the secure field below.</div>';
  html += '<div id="module-card-element" class="stripe-card-element"></div>';
  html += '<div id="module-card-errors" class="card-errors"></div></div>';
  html += '<button type="submit" class="module-submit-btn">Pay $' + cfg.price + ' and submit application</button>';
  html += '<p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:6px">Secured by Stripe - Reviewed by Dimitri Bourne before delivery</p>';
  html += '</form>';

  container.innerHTML = html;
  document.getElementById('module-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (stripe) {
    var el = stripe.elements().create('card', {
      style: { base: { fontSize: '14px', color: '#1a1a2e', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' } }
    });
    el.mount('#module-card-element');
    window._moduleCardEl = el;
  }

  document.getElementById('module-form').addEventListener('submit', submitModuleForm);
}

function closeModuleModal() {
  document.getElementById('module-modal').style.display = 'none';
  document.body.style.overflow = '';
  window._moduleCardEl = null;
}

async function submitModuleForm(e) {
  e.preventDefault();
  var form = e.target;
  var type = form.dataset.type;
  var price = parseInt(form.dataset.price);
  var btn = form.querySelector('.module-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Processing payment...';

  var data = { service: type, submitted_at: new Date().toISOString() };
  new FormData(form).forEach(function(v, k) { data[k] = v; });

  if (stripe && window._moduleCardEl) {
    var nameField = data.full_name || data.your_name || data.employer_name || 'Client';
    var emailField = data.email || data.your_email || '';
    var pmResult = await stripe.createPaymentMethod({ type: 'card', card: window._moduleCardEl, billing_details: { name: nameField, email: emailField } });
    if (pmResult.error) {
      document.getElementById('module-card-errors').textContent = pmResult.error.message;
      btn.disabled = false;
      btn.textContent = 'Pay $' + price + ' and submit';
      return;
    }
    try {
      var res = await fetch('/api/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethodId: pmResult.paymentMethod.id, amount: price * 100, currency: 'aud', description: 'Bourne Law - ' + type, name: nameField }) });
      var result = await res.json();
      if (!result.success) {
        document.getElementById('module-card-errors').textContent = result.error || 'Payment failed. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Pay $' + price + ' and submit';
        return;
      }
    } catch(err) {
      document.getElementById('module-card-errors').textContent = 'Network error - please try again.';
      btn.disabled = false;
      btn.textContent = 'Pay $' + price + ' and submit';
      return;
    }
  }

  try { await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch(e) {}

  document.getElementById('module-form-container').innerHTML = '<div class="success-box"><div class="success-icon">&#10003;</div><h4>Application received!</h4><p>Payment confirmed. Your application has been submitted to Bourne Law for review. You will receive a confirmation email shortly.</p></div>';
  document.getElementById('modal-service-title').textContent = 'Application submitted';
}

document.addEventListener('click', function(e) {
  if (e.target === document.getElementById('module-modal')) closeModuleModal();
});

// MOBILE MENU
var hamburger = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobile-menu');
if (hamburger) { hamburger.addEventListener('click', function() { mobileMenu.classList.toggle('open'); }); }

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// VISA BUTTONS PREFILL
document.querySelectorAll('.visa-btn[data-visa]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var visaType = btn.getAttribute('data-visa');
    var select = document.getElementById('visa-select');
    if (select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === visaType || select.options[i].value === visaType) { select.selectedIndex = i; break; }
      }
    }
  });
});

// TOAST
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3500);
}

// ENQUIRY FORM
var enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var btn = enquiryForm.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      var res = await fetch(enquiryForm.action, { method: 'POST', body: new FormData(enquiryForm), headers: { Accept: 'application/json' } });
      if (res.ok) { showToast('Enquiry sent - we will respond within one business day.'); enquiryForm.reset(); }
      else { showToast('Something went wrong. Please email dimitri@bournelaw.com.au'); }
    } catch(err) { showToast('Could not send. Please email dimitri@bournelaw.com.au'); }
    finally { btn.disabled = false; btn.textContent = 'Send enquiry'; }
  });
}

// STRIPE INVOICE PAYMENT
var stripe, cardElement;

function initStripe() {
  if (typeof Stripe === 'undefined') return;
  stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  var elements = stripe.elements();
  cardElement = elements.create('card', {
    style: { base: { fontSize: '14px', color: '#1a1a2e', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', '::placeholder': { color: '#aab' } }, invalid: { color: '#c0392b' } }
  });
  var mountEl = document.getElementById('card-element');
  if (mountEl) cardElement.mount('#card-element');
  cardElement.on('change', function(e) {
    var el = document.getElementById('card-errors');
    if (el) el.textContent = e.error ? e.error.message : '';
  });
}

var paymentForm = document.getElementById('payment-form');
if (paymentForm) {
  paymentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!stripe || !cardElement) { showToast('Stripe is not configured yet.'); return; }
    var btn = document.getElementById('pay-btn');
    btn.disabled = true; btn.textContent = 'Processing...';
    var invoice = document.getElementById('invoice-number').value.trim();
    var amount = parseFloat(document.getElementById('payment-amount').value);
    var name = document.getElementById('payer-name').value.trim();
    if (!invoice || !amount || !name) { showToast('Please fill in all payment fields.'); btn.disabled = false; btn.textContent = 'Pay securely'; return; }
    var pmResult = await stripe.createPaymentMethod({ type: 'card', card: cardElement, billing_details: { name: name } });
    if (pmResult.error) { document.getElementById('card-errors').textContent = pmResult.error.message; btn.disabled = false; btn.textContent = 'Pay securely'; return; }
    try {
      var res = await fetch('/api/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethodId: pmResult.paymentMethod.id, amount: Math.round(amount * 100), currency: 'aud', description: 'Bourne Law Invoice #' + invoice, name: name }) });
      var data = await res.json();
      if (data.success) { showToast('Payment of $' + amount.toFixed(2) + ' received. Reference: ' + invoice); paymentForm.reset(); cardElement.clear(); }
      else { document.getElementById('card-errors').textContent = data.error || 'Payment failed.'; }
    } catch(err) { document.getElementById('card-errors').textContent = 'Network error. Please try again.'; }
    finally { btn.disabled = false; btn.textContent = 'Pay securely'; }
  });
}

window.addEventListener('load', initStripe);
