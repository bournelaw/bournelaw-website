// HTML -> PDF using headless Chromium (works on Vercel serverless)
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function htmlToPdf(html) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 8000 });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '22mm', right: '20mm', bottom: '22mm', left: '20mm' },
      printBackground: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

module.exports = { htmlToPdf };
