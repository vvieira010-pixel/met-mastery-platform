const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const url = 'http://127.0.0.1:5175/';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);

  const report = await p.evaluate(() => {
    const h1 = document.querySelector('.hero h1');
    const out = {};
    out.heroH1Font = h1 ? getComputedStyle(h1).fontFamily : 'MISSING';
    out.h1Count = document.querySelectorAll('h1').length;
    out.h2Count = document.querySelectorAll('h2').length;
    // structure
    out.outerTag = document.querySelector('.landing-preview')?.tagName;
    out.hasMain = !!document.querySelector('main#main');
    out.hasSkip = !!document.querySelector('a.skip-nav');
    out.headerOutsideMain = (() => {
      const h = document.querySelector('.site-header');
      const m = document.querySelector('main#main');
      return h && m ? h.parentElement === m.parentElement : false;
    })();
    // dead anchors
    out.deadProgress = document.querySelectorAll('a[href="#progress"]').length;
    out.deadTimer = document.querySelectorAll('a[href="#timer"]').length;
    out.deadTopFinal = !!document.querySelector('.final-cta a[href="#top"]');
    // demo + buttons
    out.demoButton = !!document.querySelector('.demo-link');
    out.mobileSignin = !!document.querySelector('.mobile-signin');
    // font faces loaded
    out.dmSansLoaded = [...document.fonts].some(f => f.family.includes('DM Sans') && f.status === 'loaded');
    out.cormorantLoaded = [...document.fonts].some(f => f.family.includes('Cormorant') && f.status === 'loaded');
    // preselected answer index (should be 0)
    const checked = document.querySelector('input[name="answer"]:checked');
    out.preselectedValue = checked ? checked.value : 'none';
    return out;
  });

  console.log('VERIFY', JSON.stringify(report, null, 2));
  console.log('CONSOLE_ERRORS', JSON.stringify(errors.slice(0, 10)));

  // screenshots
  await p.screenshot({ path: '.tmp/verify-desktop.png', fullPage: true });
  const mob = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await mob.goto(url, { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1500);
  await mob.screenshot({ path: '.tmp/verify-mobile.png', fullPage: true });

  // overflow check both
  const dOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('DESKTOP_OVERFLOW_PX', dOverflow);

  await browser.close();
})();
