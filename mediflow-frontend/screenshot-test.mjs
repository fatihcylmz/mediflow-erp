import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const routes = [
  { path: '/', name: 'login' },
  { path: '/admin/dashboard', name: 'admin-dashboard' },
  { path: '/admin/drugs', name: 'admin-drugs' },
  { path: '/admin/orders', name: 'admin-orders' },
  { path: '/admin/shipments', name: 'admin-shipments' },
  { path: '/admin/invoices', name: 'admin-invoices' },
  { path: '/admin/inventories', name: 'admin-inventories' },
  { path: '/admin/prescriptions', name: 'admin-prescriptions' },
  { path: '/admin/pricing', name: 'admin-pricing' },
  { path: '/admin/ingredients', name: 'admin-ingredients' },
  { path: '/admin/warehouses', name: 'admin-warehouses' },
  { path: '/admin/users', name: 'admin-users' },
  { path: '/admin/returns', name: 'admin-returns' },
  { path: '/admin/sales', name: 'admin-sales' },
  { path: '/admin/payments', name: 'admin-payments' },
  { path: '/pharmacy/dashboard', name: 'pharmacy-dashboard' },
  { path: '/pharmacy/orders', name: 'pharmacy-orders' },
  { path: '/pharmacy/drugs', name: 'pharmacy-drugs' },
  { path: '/pharmacy/prescriptions', name: 'pharmacy-prescriptions' },
  { path: '/pharmacy/sales', name: 'pharmacy-sales' },
  { path: '/pharmacy/payments', name: 'pharmacy-payments' },
  { path: '/supplier/dashboard', name: 'supplier-dashboard' },
  { path: '/supplier/orders', name: 'supplier-orders' },
  { path: '/supplier/shipments', name: 'supplier-shipments' },
  { path: '/supplier/invoices', name: 'supplier-invoices' },
  { path: '/supplier/payments', name: 'supplier-payments' },
  { path: '/warehouse/dashboard', name: 'warehouse-dashboard' },
  { path: '/warehouse/warehouses', name: 'warehouse-warehouses' },
  { path: '/warehouse/inventories', name: 'warehouse-inventories' },
  { path: '/warehouse/shipments', name: 'warehouse-shipments' },
  { path: '/warehouse/drugs', name: 'warehouse-drugs' },
];

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // First login
  console.log('🔐 Logging in...');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Fill login form
  await page.fill('input[placeholder*="admin_mehmet"]', 'admin_mehmet');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('✅ Logged in as admin');

  // Take screenshot of each route
  for (const route of routes) {
    const url = BASE_URL + route.path;
    try {
      console.log(`📸 Capturing ${route.name} (${route.path})...`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Check for errors
      const errors = await page.evaluate(() => {
        const consoleErrors = [];
        const originalError = console.error;
        console.error = (...args) => consoleErrors.push(args.join(' '));
        return consoleErrors;
      });

      await page.screenshot({
        path: `screenshots/${route.name}.png`,
        fullPage: true,
        animations: 'disabled'
      });
      console.log(`   ✅ Saved: screenshots/${route.name}.png`);
    } catch (err) {
      console.log(`   ❌ Error capturing ${route.path}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n🎉 All screenshots completed!');
}

import fs from 'fs';
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

takeScreenshots().catch(console.error);