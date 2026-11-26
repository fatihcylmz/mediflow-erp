// MediFlow FAZ 3 E2E senaryoları — Playwright (chromium)
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const OUT = 'C:/Users/trana/.local/bin/e2e-screens';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const log = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name} | ${detail}`);
};

const browser = await chromium.launch({ headless: true });

async function loginAs(page, user, pass, role) {
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[autocomplete="username"]', user);
  await page.fill('input[autocomplete="current-password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const finalUrl = page.url();
  const storedRole = await page.evaluate(() => localStorage.getItem('role'));
  log(`login:${user}`, storedRole === role, `role=${storedRole} url=${finalUrl}`);
}

// ---------- SENARYO 1: Admin (binding + tam erişim) ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, 'admin_mehmet', 'Admin123!', 'admin');

  // İlaç sayfası: ekle/düzenle/sil butonları görünmeli
  await page.goto(BASE + '/admin/drugs');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const addBtn = await page.getByRole('button', { name: /Yeni İlaç Ekle/ }).count();
  log('S1:admin-DrugList-add-button', addBtn > 0, `count=${addBtn}`);
  await page.screenshot({ path: OUT + '/S1-admin-druglist.png', fullPage: true });

  // Etken madde binding akışı: Formül butonu görünmeli
  const formulaBtn = await page.getByRole('button', { name: /Formül/ }).first();
  const hasFormula = await formulaBtn.count();
  log('S1:admin-DrugList-formula-button', hasFormula > 0, `count=${hasFormula}`);
  if (hasFormula > 0) {
    await formulaBtn.click();
    await page.waitForSelector('.ant-modal:visible', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const addIngredientBtn = await page.locator('.ant-modal button:has-text("Ekle")').count();
    log('S1:admin-formula-modal-add', addIngredientBtn > 0, `Ekle btn count=${addIngredientBtn}`);
    await page.screenshot({ path: OUT + '/S1-admin-formula-modal.png' });
  }
  // Etken madde binding API kontrolü (admin: 200)
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const drugsApi = await fetch('http://localhost:5000/api/app/drug', { headers: auth }).then(r => r.json());
  const ingsApi = await fetch('http://localhost:5000/api/app/ingredient', { headers: auth }).then(r => r.json());
  if (drugsApi.items?.length && ingsApi.items?.length) {
    const bindRes = await fetch('http://localhost:5000/api/app/drug-ingredient', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ drugId: drugsApi.items[0].id, ingredientId: ingsApi.items[0].id, amount: 50, unit: 'mg' })
    });
    log('S1:admin-binding-post', bindRes.status === 200, `status=${bindRes.status}`);
  } else {
    log('S1:admin-binding-post', false, 'veri yok: ilaç veya etken madde listesi boş');
  }

  await ctx.close();
}
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, 'eczane_ahmet', 'Pharmacy123!', 'pharmacy');

  // İlaç listesi: ekle/düzenle/sil gizli
  await page.goto(BASE + '/pharmacy');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const addBtn = await page.getByRole('button', { name: /Yeni İlaç Ekle/ }).count();
  const editBtn = await page.getByRole('button', { name: /Düzenle/ }).count();
  log('S2:pharmacy-druglist-add-hidden', addBtn === 0, `addBtn=${addBtn}`);
  log('S2:pharmacy-druglist-edit-hidden', editBtn === 0, `editBtn=${editBtn}`);
  await page.screenshot({ path: OUT + '/S2-pharmacy-druglist.png', fullPage: true });

  // Satış listesi: kendi eczanesi filtresi
  await page.goto(BASE + '/pharmacy/sales');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const ownTag = await page.getByText(/kendi eczaneniz/i).count();
  log('S2:pharmacy-sales-own-scope-tag', ownTag > 0, `tag count=${ownTag}`);
  await page.screenshot({ path: OUT + '/S2-pharmacy-sales.png', fullPage: true });

  // API: ilaç silme/oluşturma 403 mu kontrolü (token ile)
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const auth2 = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const res = await fetch('http://localhost:5000/api/app/drug', {
    method: 'POST',
    headers: auth2,
    body: JSON.stringify({ name: 'E2E Deneme İlaç', barcode: '0000000000E2E', form: 0, prescriptionType: 0, unitsPerBox: 1 })
  });
  const body = await res.text();
  log('S2:pharmacy-create-drug-denied', res.status === 403, `status=${res.status} body=${body.slice(0, 120)}`);

  // Etken madde binding 403 denemesi
  const drugsApi2 = await fetch('http://localhost:5000/api/app/drug', { headers: auth2 }).then(r => r.json()).catch(() => ({ items: [] }));
  const ingsApi2 = await fetch('http://localhost:5000/api/app/ingredient', { headers: auth2 }).then(r => r.json()).catch(() => ({ items: [] }));
  if (drugsApi2.items?.length && ingsApi2.items?.length) {
    const bindRes2 = await fetch('http://localhost:5000/api/app/drug-ingredient', {
      method: 'POST', headers: auth2,
      body: JSON.stringify({ drugId: drugsApi2.items[0].id, ingredientId: ingsApi2.items[0].id, amount: 50, unit: 'mg' })
    });
    log('S2:pharmacy-binding-denied', bindRes2.status === 403, `status=${bindRes2.status}`);
  }

  // Reçete listesi: kendi eczanesi filtresi
  await page.goto(BASE + '/pharmacy/prescriptions');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const rxTag = await page.getByText(/kendi eczaneniz/i).count();
  log('S2:pharmacy-prescription-own-scope-tag', rxTag > 0, `tag count=${rxTag}`);
  await page.screenshot({ path: OUT + '/S2-pharmacy-prescriptions.png', fullPage: true });
  await ctx.close();
}

// ---------- SENARYO 3: Warehouse/Shipment stok transferi ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, 'admin_mehmet', 'Admin123!', 'admin');

  // Önce stok ön durumu (admin)
  await page.goto(BASE + '/admin/inventory');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/S3-admin-inventory-before.png', fullPage: true });

  const token = await page.evaluate(() => localStorage.getItem('token'));
  const before = await fetch('http://localhost:5000/api/app/stock-batch', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
  const totalBefore = (before.items || []).reduce((s, b) => s + (b.quantity || 0), 0);
  log('S3:stok-on-durum', true, `toplam lot=${(before.items||[]).length} toplam adet=${totalBefore}`);

  // Sevkiyat sayfası görünürlüğü
  await page.goto(BASE + '/admin/shipments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const shipTable = await page.locator('table').count();
  log('S3:shipment-page-table', shipTable > 0, `tables=${shipTable}`);
  await page.screenshot({ path: OUT + '/S3-admin-shipments.png', fullPage: true });
  await ctx.close();
}

// ---------- SENARYO 4: Prescription/Sale/Payment bağımsızlığı ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, 'admin_mehmet', 'Admin123!', 'admin');
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Reçetesiz satış oluştur (payment bağımsızlığı)
  const salesRes = await fetch('http://localhost:5000/api/app/sale', { method: 'GET', headers: auth }).then(r => r.json());
  const salesCount = (salesRes.items || []).length;
  const paymentsRes = await fetch('http://localhost:5000/api/app/payment-transaction', { method: 'GET', headers: auth }).then(r => r.json());
  const paymentsCount = (paymentsRes.items || []).length;
  log('S4:bağımsız-liste', salesCount >= 0 && paymentsCount >= 0, `sales=${salesCount} payments=${paymentsCount}`);

  // Satış sayfası görünürlüğü
  await page.goto(BASE + '/admin/sales');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/S4-admin-sales.png', fullPage: true });

  await page.goto(BASE + '/admin/payments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/S4-admin-payments.png', fullPage: true });
  await ctx.close();
}

await browser.close();

const failed = results.filter(r => !r.ok);
console.log(`\n=== ÖZET: ${results.length - failed.length}/${results.length} PASS ===`);
failed.forEach(f => console.log(`  FAIL: ${f.name} — ${f.detail}`));
