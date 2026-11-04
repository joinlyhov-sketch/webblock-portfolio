const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.request.post('http://localhost:3000/api/mock-auth', { multipart: { role: 'USER' }, maxRedirects: 0 });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle' });
  await page.getByRole('combobox', { name: /category/i }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: '.template-filter-open.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.screenshot({ path: '.template-filter-closed.png' });
  await browser.close();
})();
