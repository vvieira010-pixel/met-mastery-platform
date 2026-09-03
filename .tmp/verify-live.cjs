const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const url = 'https://met-mastery.vercel.app/';
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    console.log('GOTO_ERR', e.message);
  }
  await page.waitForTimeout(2500); // allow SPA hydration

  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const bodyText = document.body.innerText || '';
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    return {
      title: document.title,
      h1text: h1 ? h1.innerText.slice(0, 90) : null,
      h1font: h1 ? getComputedStyle(h1).fontFamily : null,
      hasNewDate: bodyText.includes('12 May 2026'),
      hasOldDate: bodyText.includes('May 12, 2026'),
      deadTopAnchors: anchors.filter(a => a.getAttribute('href') === '#top').length,
      buttonCount: document.querySelectorAll('button').length,
      // brand color usage on landing
      primaryUsed: getComputedStyle(document.body).getPropertyValue('--brand-primary') || '(none)',
    };
  });

  console.log(JSON.stringify({ url, info, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
