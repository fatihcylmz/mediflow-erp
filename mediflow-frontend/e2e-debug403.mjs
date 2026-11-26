// Debug: check which API calls return 403 for pharmacy on sales/prescriptions pages
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000';
const browser = await chromium.launch({ headless: true });

const page = await browser.newPage();
const network403s = [];
page.on('response', res => {
  if (res.status() === 403) network403s.push(res.url());
});

await page.goto(BASE + '/login');
await page.waitForLoadState('networkidle');
await page.fill('input[autocomplete="username"]', 'eczane_ahmet');
await page.fill('input[autocomplete="current-password"]', 'Pharmacy123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

// Check sales page
await page.goto(BASE + '/pharmacy/sales');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
console.log(`=== /pharmacy/sales ===`);
console.log(`403 URLs: ${network403s.length}`);
network403s.slice(0, 10).forEach(u => console.log(`  403: ${u}`));

// Check prescriptions page
await page.goto(BASE + '/pharmacy/prescriptions');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
console.log(`\n=== /pharmacy/prescriptions ===`);
console.log(`403 URLs: ${network403s.length}`);
network403s.slice(0, 10).forEach(u => console.log(`  403: ${u}`));

await browser.close();
