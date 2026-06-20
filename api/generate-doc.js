// Document generation for each self-service product
// Returns a complete HTML string suitable for review and email delivery

const TODAY = () => new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Brisbane' });

const LETTERHEAD = `
<div style="border-bottom:3px solid #0f2654;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end">
  <div>
    <div style="font-size:22px;font-weight:700;color:#0f2654;letter-spacing:-0.5px">BOURNE LAW</div>
    <div style="font-size:12px;color:#555;margin-top:2px">Solicitors &amp; Migration Agents</div>
  </div>
  <div style="text-align:right;font-size:11px;color:#555;line-height:1.7">
    PO Box 6286, Gold Coast Mail Centre QLD 9726<br>
    dimitri@bournelaw.com.au &nbsp;|&nbsp; 0402 266 989<br>
    LPN 5511816
  </div>
</div>`;

const FOOTER_NOTE = `<div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#888;line-height:1.6">
  This document has been prepared by Bourne Law. It requires review and approval by Dimitri Bourne before release to the client. This document does not constitute legal advice until formally executed.
</div>`;

function wrap(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1a1a2e; max-width: 780px; margin: 0 auto; padding: 40px 32px; font-size: 14px; line-height: 1.7; }
    h1 { font-size: 18px; color: #0f2654; margin: 0 0 4px; }
    h2 { font-size: 15px; color: #0f2654; margin: 24px 0 8px; border-bottom: 1px solid #e0e4ef; padding-bottom: 4px; }
    p { margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td { padding: 7px 10px; vertical-align: top; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    td:first-child { color: #555; width: 38%; font-weight: 500; }
    .highlight { background: #f7f8fc; padding: 14px 16px; border-left: 3px solid #0f2654; margin: 16px 0; font-size: 13px; }
    .sig-block { margin-top: 40px; }
    .sig-line { border-bottom: 1px solid #333; width: 260px; margin-bottom: 4px; height: 32px; }
    .badge { display:inline-block; background:#e8eef7; color:#0f2654; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; }
  </style>
  </head><body>${LETTERHEAD}${body}${FOOTER_NOTE}</body></html>`;
}

function generateDemand(d) {
  const body = `
    <h1>LETTER OF DEMAND</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: LOD-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()}</p>
    <p>
      ${d.debtor_name}<br>
      ${d.debtor_address}
    </p>
    <p><strong>Dear ${d.debtor_name},</strong></p>
    <p>We act for <strong>${d.your_name}</strong> in relation to monies owed to our client.</p>
    <p>We are instructed that you owe our client the sum of <strong>$${parseFloat(d.amount_owed || 0).toLocaleString('en-AU', {minimumFractionDigits:2})} AUD</strong> arising from the following:</p>
    <div class="highlight">${d.debt_reason || '[Reason for debt]'}</div>
    ${d.previous_contact ? `<p>Despite previous attempts to resolve this matter — including ${d.previous_contact} — the amount remains outstanding.</p>` : ''}
    <p>TAKE NOTICE that unless the full amount of <strong>$${parseFloat(d.amount_owed || 0).toLocaleString('en-AU', {minimumFractionDigits:2})}</strong> is paid to our client within <strong>${d.deadline || '14 days'}</strong> of the date of this letter, our client reserves the right to:</p>
    <ol>
      <li>Commence proceedings in the appropriate court without further notice;</li>
      <li>Seek judgment for the full amount plus interest and legal costs; and</li>
      <li>Pursue all available legal remedies including enforcement against your assets.</li>
    </ol>
    <p>Payment should be made to our client directly or via our trust account. Contact us to arrange payment.</p>
    <p>We trust this matter can be resolved promptly.</p>
    <div class="sig-block">
      <p>Yours faithfully,</p>
      <div class="sig-line"></div>
      <p><strong>Dimitri Bourne</strong><br>Solicitor &amp; Migration Agent<br>Bourne Law<br>${TODAY()}</p>
    </div>`;
  return wrap('Letter of Demand', body);
}

function generateWill(d) {
  const body = `
    <h1>WILL PREPARATION — CLIENT INSTRUCTIONS</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: WILL-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()}</p>
    <h2>Testator Details</h2>
    <table>
      <tr><td>Full legal name</td><td>${d.full_name || ''}</td></tr>
      <tr><td>Date of birth</td><td>${d.dob || ''}</td></tr>
      <tr><td>Residential address</td><td>${d.address || ''}</td></tr>
      <tr><td>Type</td><td>${d.couple || 'Single will'}</td></tr>
    </table>
    <h2>Executor</h2>
    <table>
      <tr><td>Name</td><td>${d.executor_name || ''}</td></tr>
      <tr><td>Relationship</td><td>${d.executor_relation || ''}</td></tr>
    </table>
    <h2>Beneficiaries</h2>
    <div class="highlight">${(d.beneficiaries || '').replace(/\n/g,'<br>')}</div>
    <h2>Estate Assets</h2>
    <div class="highlight">${(d.assets || '').replace(/\n/g,'<br>')}</div>
    ${d.guardian ? `<h2>Guardian for Minor Children</h2><p>${d.guardian}</p>` : ''}
    ${d.special_wishes ? `<h2>Special Wishes / Instructions</h2><div class="highlight">${d.special_wishes.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Contact</h2>
    <table>
      <tr><td>Email</td><td>${d.email || ''}</td></tr>
      <tr><td>Phone</td><td>${d.phone || ''}</td></tr>
    </table>
    <div class="highlight" style="margin-top:24px">
      <strong>Solicitor action required:</strong> Draft Will based on instructions above. Once drafted, arrange execution appointment with client. Will must be signed in presence of two independent adult witnesses.
    </div>
    <div class="sig-block">
      <p>Prepared by:</p>
      <div class="sig-line"></div>
      <p><strong>Dimitri Bourne</strong><br>Solicitor, Bourne Law<br>${TODAY()}</p>
    </div>`;
  return wrap('Will Kit', body);
}

function generateEligibility(d) {
  const body = `
    <h1>VISA ELIGIBILITY ASSESSMENT REPORT</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: VER-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()} &nbsp;|&nbsp; <span class="badge">MARA Agent LPN 5511816</span></p>
    <h2>Client Profile</h2>
    <table>
      <tr><td>Full name</td><td>${d.full_name || ''}</td></tr>
      <tr><td>Nationality</td><td>${d.nationality || ''}</td></tr>
      <tr><td>Date of birth</td><td>${d.dob || ''}</td></tr>
      <tr><td>Occupation</td><td>${d.occupation || ''}${d.anzsco ? ' (ANZSCO: '+d.anzsco+')' : ''}</td></tr>
      <tr><td>Highest qualification</td><td>${d.qualifications || ''}</td></tr>
      <tr><td>English proficiency</td><td>${d.english || ''}</td></tr>
      <tr><td>Skilled work experience</td><td>${d.work_experience || ''}</td></tr>
      <tr><td>Australian work experience</td><td>${d.aus_experience || ''}</td></tr>
      <tr><td>Current visa status</td><td>${d.current_visa || ''}</td></tr>
      <tr><td>Employer sponsor available</td><td>${d.sponsor || ''}</td></tr>
      <tr><td>Australian partner/spouse</td><td>${d.partner || ''}</td></tr>
      <tr><td>Preferred state</td><td>${d.state_preference || ''}</td></tr>
      <tr><td>Previous refusals</td><td>${d.previous_refusal || 'No'}</td></tr>
    </table>
    ${d.comments ? `<h2>Additional Notes</h2><div class="highlight">${d.comments.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Eligibility Assessment</h2>
    <div class="highlight" style="border-left-color:#e67e22">
      <strong>Solicitor note:</strong> Complete visa pathway assessment below based on client profile above. Consider: skilled migration streams (189/190/491), employer-sponsored (482/186), partner, student, business, and any other applicable pathways. Include points test calculation where relevant.
    </div>
    <p>[Assessment to be completed by Dimitri Bourne]</p>
    <div class="sig-block">
      <p>Assessed by:</p>
      <div class="sig-line"></div>
      <p><strong>Dimitri Bourne</strong><br>MARA Registered Agent LPN 5511816<br>Bourne Law<br>${TODAY()}</p>
    </div>`;
  return wrap('Visa Eligibility Report', body);
}

function generateStatDec(d) {
  const body = `
    <h1>STATUTORY DECLARATION</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">${d.form_type || 'Commonwealth Statutory Declaration'} &nbsp;|&nbsp; ${TODAY()}</p>
    <p>I, <strong>${d.full_name || '[FULL NAME]'}</strong>, do solemnly and sincerely declare that:</p>
    <div class="highlight" style="font-size:14px;line-height:1.8">${(d.declaration_content || '[Declaration content]').replace(/\n/g,'<br>')}</div>
    ${d.supporting_docs ? `<p><em>Supporting documents referenced: ${d.supporting_docs}</em></p>` : ''}
    <p>And I make this solemn declaration conscientiously believing the same to be true, and by virtue of the provisions of the <em>${d.form_type && d.form_type.includes('Queensland') ? 'Oaths Act 1867 (Qld)' : 'Statutory Declarations Act 1959 (Cth)'}</em>.</p>
    <div class="sig-block">
      <p><strong>Declared at Gold Coast, Queensland</strong></p>
      <table style="margin-top:24px">
        <tr>
          <td style="border:none;padding:0 40px 0 0;vertical-align:top;width:50%">
            <div class="sig-line"></div>
            <p style="font-size:12px">Signature of person making declaration<br><strong>${d.full_name || '[Full name]'}</strong></p>
          </td>
          <td style="border:none;padding:0;vertical-align:top;width:50%">
            <div class="sig-line"></div>
            <p style="font-size:12px">Signature of authorised witness<br><strong>Dimitri Bourne</strong><br>Solicitor of the Supreme Court of Queensland</p>
          </td>
        </tr>
      </table>
      <p>Date: __________________ &nbsp;&nbsp; at: Gold Coast, QLD</p>
    </div>`;
  return wrap('Statutory Declaration', body);
}

function generateContractReview(d) {
  const body = `
    <h1>CONTRACT REVIEW REPORT</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: CR-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()}</p>
    <h2>Matter Details</h2>
    <table>
      <tr><td>Client</td><td>${d.your_name || ''}</td></tr>
      <tr><td>Contract type</td><td>${d.contract_type || ''}</td></tr>
      <tr><td>Pages</td><td>${d.contract_pages || ''}</td></tr>
      <tr><td>Client role</td><td>${d.your_role || ''}</td></tr>
      <tr><td>Contract value</td><td>${d.contract_value || 'Not specified'}</td></tr>
      <tr><td>Signing deadline</td><td>${d.sign_deadline || 'Not specified'}</td></tr>
    </table>
    <h2>Client Concerns</h2>
    <div class="highlight">${(d.key_concerns || '').replace(/\n/g,'<br>')}</div>
    <h2>Review Findings</h2>
    <div class="highlight" style="border-left-color:#e67e22">
      <strong>Solicitor action required:</strong> Review the contract document provided by the client. Complete the findings below covering: key risk areas, unfair or unusual clauses, missing protections, recommended amendments, and overall recommendation (sign / sign with amendments / do not sign).
    </div>
    <p><strong>Overall risk rating:</strong> [ ] Low &nbsp;&nbsp; [ ] Medium &nbsp;&nbsp; [ ] High</p>
    <p><strong>Recommendation:</strong> [ ] Sign as-is &nbsp;&nbsp; [ ] Sign with amendments &nbsp;&nbsp; [ ] Do not sign</p>
    <h2>Key Findings</h2>
    <p>[To be completed by Dimitri Bourne]</p>
    <h2>Recommended Amendments</h2>
    <p>[To be completed by Dimitri Bourne]</p>
    <div class="sig-block">
      <div class="sig-line"></div>
      <p><strong>Dimitri Bourne</strong><br>Solicitor, Bourne Law<br>${TODAY()}</p>
    </div>`;
  return wrap('Contract Review Report', body);
}

function generatePrenup(d) {
  const body = `
    <h1>BINDING FINANCIAL AGREEMENT</h1>
    <p style="color:#555;font-size:12px;margin-bottom:8px">Section 90B Family Law Act 1975 (Cth) &nbsp;|&nbsp; Draft for review — ${TODAY()}</p>
    <div class="highlight" style="border-left-color:#c0392b;background:#fff8f8;margin-bottom:24px">
      <strong>IMPORTANT — SOLICITOR CERTIFICATE REQUIRED:</strong> Each party must receive independent legal advice before signing. This agreement is not binding until both parties have signed and solicitor certificates are attached.
    </div>
    <h2>Parties</h2>
    <table>
      <tr><td>Party 1 (Client)</td><td><strong>${d.your_name || ''}</strong> — DOB ${d.your_dob || ''}</td></tr>
      <tr><td>Party 2</td><td><strong>${d.partner_name || ''}</strong> — DOB ${d.partner_dob || ''}</td></tr>
      <tr><td>Planned marriage date</td><td>${d.wedding_date || 'To be confirmed'}</td></tr>
    </table>
    <h2>Client Assets (Party 1)</h2>
    <div class="highlight">${(d.your_assets || '').replace(/\n/g,'<br>')}</div>
    <h2>Partner Assets (Party 2)</h2>
    <div class="highlight">${(d.partner_assets || 'As disclosed by party').replace(/\n/g,'<br>')}</div>
    ${d.debts ? `<h2>Debts and Liabilities</h2><div class="highlight">${d.debts.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Agreed Terms</h2>
    <div class="highlight">${(d.key_terms || '').replace(/\n/g,'<br>')}</div>
    ${d.comments ? `<h2>Additional Instructions</h2><div class="highlight">${d.comments.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Execution</h2>
    <table style="margin-top:24px">
      <tr>
        <td style="border:none;padding:0 40px 0 0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Signed by <strong>${d.your_name || 'Party 1'}</strong><br>Date: _____________</p>
        </td>
        <td style="border:none;padding:0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Signed by <strong>${d.partner_name || 'Party 2'}</strong><br>Date: _____________</p>
        </td>
      </tr>
    </table>`;
  return wrap('Binding Financial Agreement (BFA)', body);
}

function generateSeparation(d) {
  const body = `
    <h1>FINANCIAL AGREEMENT — SEPARATION</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Section 90C Family Law Act 1975 (Cth) &nbsp;|&nbsp; Draft — ${TODAY()}</p>
    <h2>Parties</h2>
    <table>
      <tr><td>Party 1 (Client)</td><td><strong>${d.your_name || ''}</strong></td></tr>
      <tr><td>Party 2</td><td><strong>${d.partner_name || ''}</strong></td></tr>
      <tr><td>Relationship type</td><td>${d.relationship_type || ''}</td></tr>
      <tr><td>Date of separation</td><td>${d.separation_date || ''}</td></tr>
      <tr><td>Children</td><td>${d.children || ''}</td></tr>
      <tr><td>Consent orders</td><td>${d.consent_orders || ''}</td></tr>
    </table>
    <h2>Shared Property and Assets</h2>
    <div class="highlight">${(d.property_list || '').replace(/\n/g,'<br>')}</div>
    <h2>Proposed Division</h2>
    <div class="highlight">${(d.proposed_split || '').replace(/\n/g,'<br>')}</div>
    ${d.debts ? `<h2>Debts and Liabilities</h2><div class="highlight">${d.debts.replace(/\n/g,'<br>')}</div>` : ''}
    ${d.comments ? `<h2>Additional Arrangements</h2><div class="highlight">${d.comments.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Execution</h2>
    <table style="margin-top:24px">
      <tr>
        <td style="border:none;padding:0 40px 0 0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Signed by <strong>${d.your_name || 'Party 1'}</strong><br>Date: _____________</p>
        </td>
        <td style="border:none;padding:0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Signed by <strong>${d.partner_name || 'Party 2'}</strong><br>Date: _____________</p>
        </td>
      </tr>
    </table>`;
  return wrap('Separation Agreement', body);
}

function generateEmploymentContract(d) {
  const body = `
    <h1>EMPLOYMENT AGREEMENT</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Prepared by Bourne Law &nbsp;|&nbsp; ${TODAY()}</p>
    <p>This Employment Agreement is entered into between:</p>
    <table>
      <tr><td>Employer</td><td><strong>${d.employer_name || ''}</strong> (ABN ${d.employer_abn || ''})</td></tr>
      <tr><td>Employee</td><td><strong>${d.employee_name || ''}</strong></td></tr>
      <tr><td>Position</td><td>${d.role || ''}</td></tr>
      <tr><td>Employment type</td><td>${d.employment_type || ''}</td></tr>
      <tr><td>Start date</td><td>${d.start_date || ''}</td></tr>
      <tr><td>Location</td><td>${d.location || ''}</td></tr>
      <tr><td>Hours per week</td><td>${d.hours || ''}</td></tr>
      <tr><td>Remuneration</td><td>${d.salary || ''}</td></tr>
      <tr><td>Probation period</td><td>${d.probation || ''}</td></tr>
      <tr><td>Applicable award</td><td>${d.award || 'To be confirmed'}</td></tr>
    </table>
    <h2>Key Duties and Responsibilities</h2>
    <div class="highlight">${(d.duties || '').replace(/\n/g,'<br>')}</div>
    ${d.special_conditions ? `<h2>Special Conditions and Entitlements</h2><div class="highlight">${d.special_conditions.replace(/\n/g,'<br>')}</div>` : ''}
    <h2>Standard Terms</h2>
    <p>This agreement is subject to the Fair Work Act 2009 (Cth) and the National Employment Standards. The employee is entitled to all minimum entitlements under applicable modern awards and the NES. Confidentiality, IP assignment and post-employment restraint clauses to be inserted by solicitor.</p>
    <div class="highlight" style="border-left-color:#e67e22"><strong>Solicitor action:</strong> Insert applicable award terms, confidentiality clause, IP clause, and restraint of trade provisions before releasing to client.</div>
    <table style="margin-top:32px">
      <tr>
        <td style="border:none;padding:0 40px 0 0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Employer: <strong>${d.employer_name || ''}</strong><br>Date: _____________</p>
        </td>
        <td style="border:none;padding:0;vertical-align:top">
          <div class="sig-line"></div>
          <p style="font-size:12px">Employee: <strong>${d.employee_name || ''}</strong><br>Date: _____________</p>
        </td>
      </tr>
    </table>`;
  return wrap('Employment Agreement', body);
}

function generateABN(d) {
  const body = `
    <h1>BUSINESS REGISTRATION — CLIENT INSTRUCTIONS</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: ABN-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()}</p>
    <h2>Service Requested</h2>
    <div class="highlight"><strong>${d.service_type || 'ABN only'}</strong></div>
    <h2>Applicant Details</h2>
    <table>
      <tr><td>Full legal name</td><td>${d.full_name || ''}</td></tr>
      <tr><td>Date of birth</td><td>${d.dob || ''}</td></tr>
      <tr><td>TFN held</td><td>${d.tax_file || ''}</td></tr>
      <tr><td>Business/company name</td><td>${d.business_name || ''}</td></tr>
      <tr><td>Main activity</td><td>${d.business_activity || ''}</td></tr>
      <tr><td>Structure</td><td>${d.structure || ''}</td></tr>
      <tr><td>Business address</td><td>${d.address || ''}</td></tr>
      <tr><td>Email</td><td>${d.email || ''}</td></tr>
      <tr><td>Phone</td><td>${d.phone || ''}</td></tr>
    </table>
    <div class="highlight" style="border-left-color:#e67e22;margin-top:24px">
      <strong>Action required:</strong> Complete ABN registration via ABR (abr.business.gov.au). If business name required, register via ASIC. If Pty Ltd, complete ASIC company registration. Provide client with ABN/ACN once issued.
    </div>`;
  return wrap('Business Registration', body);
}

function generateConsultation(d) {
  const body = `
    <h1>CONSULTATION BOOKING CONFIRMATION</h1>
    <p style="color:#555;font-size:12px;margin-bottom:24px">Reference: CONS-${Date.now().toString().slice(-6)} &nbsp;|&nbsp; ${TODAY()}</p>
    <h2>Booking Details</h2>
    <table>
      <tr><td>Client name</td><td>${d.full_name || ''}</td></tr>
      <tr><td>Email</td><td>${d.email || ''}</td></tr>
      <tr><td>Phone</td><td>${d.phone || ''}</td></tr>
      <tr><td>Topic</td><td>${d.consult_type || ''}</td></tr>
      <tr><td>Format</td><td>${d.consult_format || ''}</td></tr>
      <tr><td>Preferred date</td><td>${d.preferred_date || 'Flexible'}</td></tr>
      <tr><td>Preferred time</td><td>${d.preferred_time || ''}</td></tr>
    </table>
    <h2>Client Summary</h2>
    <div class="highlight">${(d.summary || '').replace(/\n/g,'<br>')}</div>
    <div class="highlight" style="border-left-color:#e67e22;margin-top:24px">
      <strong>Action required:</strong> Contact client within 1 business day to confirm appointment time. Prepare brief based on summary above.
    </div>`;
  return wrap('Consultation Booking', body);
}

function generateDocument(service, data) {
  switch (service) {
    case 'demand':            return generateDemand(data);
    case 'will':              return generateWill(data);
    case 'eligibility':       return generateEligibility(data);
    case 'stat-dec':          return generateStatDec(data);
    case 'contract-review':   return generateContractReview(data);
    case 'prenup':            return generatePrenup(data);
    case 'separation':        return generateSeparation(data);
    case 'employment-contract': return generateEmploymentContract(data);
    case 'abn':               return generateABN(data);
    case 'consultation':      return generateConsultation(data);
    default:
      return wrap('Document', `<h1>${service}</h1><pre style="font-size:12px">${JSON.stringify(data, null, 2)}</pre>`);
  }
}

module.exports = { generateDocument };
