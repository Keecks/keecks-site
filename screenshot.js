const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Desktop viewport — simile a quello nelle tue screenshot
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 6500)); // aspetta fine Phase 1

  await page.screenshot({ path: 'ss-desktop.png', fullPage: true });
  console.log('Done');
  await browser.close();
})();
