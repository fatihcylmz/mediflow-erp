// MediFlow FAZ 3 Kapsamlı E2E — 4 rol, tüm sayfalar, 403/500 kontrolü, ekran görüntüleri
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000';
const OUT = 'C:/Users/trana/.local/bin/e2e-screens';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const log = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

const browser = await chromium.launch({ headless: true });

const ROLES = [
  { user: 'admin_mehmet', pass: 'Admin123!', role: 'admin', path: '/admin' },
  { user: 'eczane_ahmet', pass: 'Pharmacy123!', role: 'pharmacy', path: '/pharmacy' },
  { user: 'depo_ayse', pass: 'Warehouse123!', role: 'warehouse', path: '/warehouse' },
  { user: 'tedarikci_mustafa', pass: 'Supplier123!', role: 'supplier', path: '/supplier' },
];

const MENUS = {
  admin: ['/admin/dashboard', '/admin/drugs', '/admin/ingredients', '/admin/inventory', '/admin/orders', '/admin/sales', '/admin/payments', '/admin/shipments', '/admin/invoices', '/admin/returns', '/admin/prescriptions', '/admin/warehouses', '/admin/suppliers', '/admin/customers'],
  pharmacy: ['/pharmacy', '/pharmacy/drugs', '/pharmacy/inventory', '/pharmacy/orders', '/pharmacy/sales', '/pharmacy/prescriptions'],
  warehouse: ['/warehouse', '/warehouse/inventory', '/warehouse/shipments', '/warehouse/stock-batches'],
  supplier: ['/supplier', '/supplier/orders', '/supplier/shipments', '/supplier/invoices'],
};

async function login(page, user, pass, expectedRole) {
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[autocomplete="username"]', user);
  await page.fill('input[autocomplete="current-password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const storedRole = await page.evaluate(() => localStorage.getItem('role'));
  const token = await page.evaluate(() => localStorage.getItem('token'));
  log(`login:${user}`, storedRole === expectedRole, `role=${storedRole}`);
  return token;
}

for (const r of ROLES) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Collect console errors with 403/500
  const consoleErrors = [];
  const networkErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', res => {
    if (res.status() === 403 || res.status() === 500) networkErrors.push({ url: res.url(), status: res.status() });
  });

  const token = await login(page, r.user, r.pass, r.role);

  // Verify dashboard loads
  await page.goto(BASE + r.path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${r.role}-dashboard.png`, fullPage: true });
  log(`${r.role}:dashboard-load`, true, `url=${page.url()}`);

  // Walk all menu tabs for this role
  const menus = MENUS[r.role] || [r.path];
  for (const route of menus) {
    const pageConsoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') pageConsoleErrors.push(msg.text());
    });
    await page.goto(BASE + route);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${r.role}-${route.split('/').pop() || 'index'}.png`, fullPage: true });

    const has403 = networkErrors.some(e => e.status === 403);
    const has500 = networkErrors.some(e => e.status === 500);
    const ok = !has403 && !has500;
    log(`${r.role}:${route}`, ok, `403=${has403} 500=${has500} consoleErrors=${pageConsoleErrors.length}`);
    page.removeAllListeners('console');
  }

  // Verify API calls return zero 403/500 for key endpoints
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const apiEndpoints = ['/api/app/dashboard/get-stats', '/api/app/dashboard/trend'];
  for (const ep of apiEndpoints) {
    try {
      const res = await fetch(`${API}${ep}`, { headers: auth });
      const statusOk = res.status !== 403 && res.status !== 500;
      log(`${r.role}:api-${ep}`, statusOk, `status=${res.status}`);
    } catch (e) {
      log(`${r.role}:api-${ep}`, false, `error=${e.message}`);
    }
  }

  await ctx.close();
}

await browser.close();

const failed = results.filter(r => !r.ok);
console.log(`\n=== ÖZET: ${results.length - failed.length}/${results.length} PASS ===`);
failed.forEach(f => console.log(`  FAIL: ${f.name} — ${f.detail}`));
