// Debug: check actual console error messages on key pages
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ headless: true });

async function checkPage(page, label, route) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push(`${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });
  await page.goto(BASE + route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  console.log(`\n=== ${label} (${route}) ===`);
  console.log(`Total console errors/warnings: ${errors.length}`);
  errors.slice(0, 10).forEach(e => console.log(`  ${e}`));
}

const page = await browser.newPage();
await checkPage(page, 'Admin Dashboard', '/admin/dashboard');
await checkPage(page, 'Admin Drugs', '/admin/drugs');
await checkPage(page, 'Pharmacy Dashboard', '/pharmacy');

await browser.close();
