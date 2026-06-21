// Shared document delivery: generates PDF, emails with attachment
const { Resend } = require('resend');

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

function buildPdfHtml(draftHtml, serviceLabel, clientName, solicitorNotes) {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #1a1a2e; line-height: 1.6; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0f2654; padding-bottom: 14px; margin-bottom: 28px; }
  .firm-name { font-size: 22pt; font-weight: 700; color: #0f2654; letter-spacing: -0.5px; }
  .firm-contact { font-size: 8.5pt; color: #666; margin-top: 5px; line-height: 1.5; }
  .doc-meta { text-align: right; font-size: 9pt; color: #555; line-height: 1.7; }
  .doc-meta strong { color: #0f2654; font-size: 11pt; }
  .solicitor-note { background: #f0f4fb; border-left: 4px solid #0f2654; padding: 12px 16px; margin-bottom: 24px; font-size: 10.5pt; border-radius: 0 4px 4px 0; }
  .content h1, .content h2, .content h3 { color: #0f2654; }
  .content table { border-collapse: collapse; width: 100%; }
  .content td, .content th { padding: 6px 8px; border-bottom: 1px solid #eee; }
  .footer { border-top: 1px solid #dde; margin-top: 48px; padding-top: 12px; font-size: 8pt; color: #999; text-align: center; }
  @page { margin: 20mm; size: A4; }
</style>
</head>
<body>
<div class="letterhead">
  <div>
    <div class="firm-name">Bourne Law</div>
    <div class="firm-contact">Solicitors &amp; Migration Agents · LPN 5511816<br>dimitri@bournelaw.com.au · 0402 266 989</div>
  </div>
  <div class="doc-meta">
    <div><strong>${serviceLabel}</strong></div>
    <div>Prepared for: ${clientName || 'Client'}</div>
    <div>${date}</div>
  </div>
</div>
${solicitorNotes ? `<div class="solicitor-note"><strong>Note from Dimitri Bourne:</strong><br>${solicitorNotes.replace(/\n/g, '<br>')}</div>` : ''}
<div class="content">${draftHtml || '<p>Document content not available. Please contact us.</p>'}</div>
<div class="footer">
  Bourne Law &nbsp;·&nbsp; PO Box 6286, Gold Coast Mail Centre QLD 9726 &nbsp;·&nbsp; dimitri@bournelaw.com.au &nbsp;·&nbsp; 0402 266 989<br>
  This document was prepared by Dimitri Bourne, Solicitor and Registered Migration Agent (MARA) LPN 5511816.
</div>
</body>
</html>`;
}

async function deliverDocument(sub) {
  if (!process.env.RESEND_API_KEY || !sub.client_email) return;

  const serviceLabel = sub.service_label || SERVICE_LABELS[sub.service] || sub.service;
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Try to generate PDF
  let pdfBuffer = null;
  try {
    const { htmlToPdf } = require('./pdf-util');
    const pdfHtml = buildPdfHtml(sub.draft_html, serviceLabel, sub.client_name, sub.solicitor_notes);
    pdfBuffer = await htmlToPdf(pdfHtml);
    console.log('PDF generated, size:', pdfBuffer.length, 'bytes');
  } catch (e) {
    console.error('PDF generation failed, falling back to HTML body:', e.message);
  }

  const notesHtml = sub.solicitor_notes
    ? `<div style="background:#f7f8fc;border-left:3px solid #0f2654;padding:12px 16px;margin:16px 0;font-size:14px"><strong>Note from Dimitri:</strong><br>${sub.solicitor_notes.replace(/\n/g, '<br>')}</div>`
    : '';

  const emailPayload = {
    from: 'Bourne Law <dimitri@bournelaw.com.au>',
    to: sub.client_email,
    subject: `Your ${serviceLabel} — Bourne Law`,
    html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px">
      <div style="background:#0f2654;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        <strong style="font-size:16px">Bourne Law — Your document is ready</strong>
      </div>
      <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px">
        <p style="margin:0 0 12px">Dear ${sub.client_name || 'Client'},</p>
        <p style="margin:0 0 12px">Thank you for your payment. Your <strong>${serviceLabel}</strong> has been prepared by Dimitri Bourne and is ${pdfBuffer ? '<strong>attached to this email as a PDF</strong>.' : 'included below.'}</p>
        ${notesHtml}
        ${!pdfBuffer ? `<hr style="margin:20px 0;border:none;border-top:1px solid #eee">${sub.draft_html || ''}` : ''}
        <p style="margin:20px 0 6px;font-size:13px">If you have any questions, contact us at <a href="mailto:dimitri@bournelaw.com.au" style="color:#0f2654">dimitri@bournelaw.com.au</a> or call 0402 266 989.</p>
        <p style="margin:0;font-size:13px">Regards,<br><strong>Dimitri Bourne</strong><br>Bourne Law</p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:11px;color:#aaa;margin:0">Bourne Law · PO Box 6286, Gold Coast Mail Centre QLD 9726 · LPN 5511816</p>
      </div>
    </div>`,
  };

  if (pdfBuffer) {
    const safeName = serviceLabel.replace(/[^a-zA-Z0-9\s\-]/g, '').trim().replace(/\s+/g, '-');
    emailPayload.attachments = [{
      filename: `${safeName}-Bourne-Law.pdf`,
      content: pdfBuffer.toString('base64'),
    }];
  }

  await resend.emails.send(emailPayload);
}

module.exports = { deliverDocument };
