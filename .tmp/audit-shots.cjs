const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const url = 'http://127.0.0.1:5175/';

  // Desktop
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await desk.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '.tmp/shot-desktop.png', fullPage: true });

  const fonts = await p.evaluate(() => {
    const h1 = document.querySelector('.hero h1');
    const body = document.querySelector('.hero-copy > p:not(.eyebrow)');
    const cta = document.querySelector('.hero-primary');
    const g = (el) => el ? getComputedStyle(el).fontFamily : 'MISSING';
    return {
      heroH1: g(h1),
      heroBody: g(body),
      heroCTA: g(cta),
      loadedFaces: [...document.fonts].map(f => f.family + ':' + f.status).slice(0, 10),
    };
  });

  const overflow = await p.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));

  console.log('FONTS', JSON.stringify(fonts, null, 2));
  console.log('OVERFLOW desktop', JSON.stringify(overflow));

  // Mobile
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const m = await mob.newPage();
  await m.goto(url, { waitUntil: 'networkidle' });
  await m.waitForTimeout(1500);
  await m.screenshot({ path: '.tmp/shot-mobile.png', fullPage: true });

  const mOverflow = await m.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log('OVERFLOW mobile', JSON.stringify(mOverflow));

  // Tablet gap test (831-850 band)
  const tab = await browser.newContext({ viewport: { width: 840, height: 1000 } });
  const t = await tab.newPage();
  await t.goto(url, { waitUntil: 'networkidle' });
  await t.waitForTimeout(1200);
  await t.screenshot({ path: '.tmp/shot-840.png', fullPage: true });
  const tOverflow = await t.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log('OVERFLOW 840', JSON.stringify(tOverflow));

  await browser.close();
})();
