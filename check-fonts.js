const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2 });

  const loadedFonts = [];
  page.on('response', (res) => {
    if (res.url().includes('/fonts/')) {
      loadedFonts.push(`${res.status()} ${res.url().split('/fonts/')[1]}`);
    }
  });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('\n=== FONTS LOADED ===');
  loadedFonts.forEach(f => console.log(f));

  // Check rendered fonts on key elements
  const fonts = await page.evaluate(() => {
    const els = {
      heroTitle: document.querySelector('.hero__title'),
      demoTitle: document.querySelector('.demo__title'),
      stepTitle: document.querySelector('.step__title'),
      cardTitle: document.querySelector('.who__card-title'),
      tag: document.querySelector('.tag'),
    };
    const result = {};
    for (const [key, el] of Object.entries(els)) {
      if (el) {
        const cs = window.getComputedStyle(el);
        result[key] = cs.fontFamily + ' | ' + cs.fontSize + ' | w:' + cs.fontWeight;
      }
    }
    return result;
  });

  console.log('\n=== RENDERED FONTS ===');
  for (const [el, font] of Object.entries(fonts)) {
    console.log(`${el}: ${font}`);
  }

  await browser.close();
})();
