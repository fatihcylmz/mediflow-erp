// MediFlow Tedarikçi (Supplier) E2E Testi — Depot-centric B2B workflow
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

// Helper: Login as tedarikci_mustafa
async function loginAsSupplier(page) {
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[autocomplete="username"]', 'tedarikci_mustafa');
  await page.fill('input[autocomplete="current-password"]', 'Supplier123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const storedRole = await page.evaluate(() => localStorage.getItem('role'));
  log('login:tedarikci_mustafa', storedRole === 'supplier', `role=${storedRole} url=${page.url()}`);
}

// ---------- SCENARIO 1: Supplier Dashboard ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  await page.goto(BASE + '/supplier');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const heading = await page.getByText(/B2B Depo Dashboard/i).count();
  log('S1:supplier-dashboard-heading', heading > 0, `count=${heading}`);
  await page.screenshot({ path: OUT + '/supplier-dashboard.png', fullPage: true });

  // KPI cards visible
  const totalDepo = await page.getByText(/Toplam Depo/i).count();
  log('S1:supplier-kpi-total-depo', totalDepo > 0, `count=${totalDepo}`);

  // No pharmacy references
  const pharmacyRefs = await page.getByText(/eczane/i).count();
  log('S1:supplier-no-pharmacy-ref', pharmacyRefs === 0, `pharmacy mentions=${pharmacyRefs}`);

  await ctx.close();
}

// ---------- SCENARIO 2: Supplier Order List ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  await page.goto(BASE + '/supplier/orders');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const heading = await page.getByText(/Depo Sipariş Listesi/i).count();
  log('S2:supplier-order-list-heading', heading > 0, `count=${heading}`);
  await page.screenshot({ path: OUT + '/supplier-orders.png', fullPage: true });

  // "Sipariş Veren Depo" column visible
  const depoColumn = await page.getByText(/Sipariş Veren Depo/i).count();
  log('S2:supplier-depo-column', depoColumn > 0, `count=${depoColumn}`);

  // No pharmacy column
  const pharmacyColumn = await page.getByText(/Eczane/i).count();
  log('S2:supplier-no-pharmacy-column', pharmacyColumn === 0, `eczane mentions=${pharmacyColumn}`);

  // No +Yeni Sipariş button
  const addBtn = await page.getByRole('button', { name: /Yeni Sipariş/i }).count();
  log('S2:supplier-no-add-order-btn', addBtn === 0, `add btn count=${addBtn}`);

  // No sil (delete) buttons
  const deleteBtns = await page.locator('button:has-text("Sil")').count();
  log('S2:supplier-no-delete-btn', deleteBtns === 0, `delete btn count=${deleteBtns}`);

  await ctx.close();
}

// ---------- SCENARIO 3: Supplier Shipment List ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  await page.goto(BASE + '/supplier/shipments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const heading = await page.getByText(/B2B Sevkiyat Yönetimi/i).count();
  log('S3:supplier-shipment-list-heading', heading > 0, `count=${heading}`);
  await page.screenshot({ path: OUT + '/supplier-shipments.png', fullPage: true });

  // "Hedef Depo" column visible
  const hedefDepoColumn = await page.getByText(/Hedef Depo/i).count();
  log('S3:supplier-hedef-depo-column', hedefDepoColumn > 0, `count=${hedefDepoColumn}`);

  // No Yeni Sevkiyat button
  const addBtn = await page.getByRole('button', { name: /Yeni Sevkiyat/i }).count();
  log('S3:supplier-no-add-shipment-btn', addBtn === 0, `add btn count=${addBtn}`);

  await ctx.close();
}

// ---------- SCENARIO 4: Supplier Invoice List ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  await page.goto(BASE + '/supplier/invoices');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const heading = await page.getByText(/B2B Fatura Yönetimi/i).count();
  log('S4:supplier-invoice-list-heading', heading > 0, `count=${heading}`);
  await page.screenshot({ path: OUT + '/supplier-invoices.png', fullPage: true });

  // "Alıcı Depo" column visible
  const aliciDepoColumn = await page.getByText(/Alıcı Depo/i).count();
  log('S4:supplier-alici-depo-column', aliciDepoColumn > 0, `count=${aliciDepoColumn}`);

  // No pharmacy reference
  const pharmacyRefs = await page.getByText(/eczane/i).count();
  log('S4:supplier-no-pharmacy-ref', pharmacyRefs === 0, `eczane mentions=${pharmacyRefs}`);

  // No +Yeni Fatura button
  const addBtn = await page.getByRole('button', { name: /Yeni Fatura Ekle/i }).count();
  log('S4:supplier-no-add-invoice-btn', addBtn === 0, `add btn count=${addBtn}`);

  // No iptal (cancel) buttons
  const cancelBtns = await page.locator('button:has-text("İptal Et")').count();
  log('S4:supplier-no-cancel-btn', cancelBtns === 0, `cancel btn count=${cancelBtns}`);

  // KPI "depoya gönderildi"
  const depoGonderildi = await page.getByText(/depoya gönderildi/i).count();
  log('S4:supplier-depo-gonderildi-kpi', depoGonderildi > 0, `count=${depoGonderildi}`);

  await ctx.close();
}

// ---------- SCENARIO 5: Supplier Payment List ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  await page.goto(BASE + '/supplier/payments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const heading = await page.getByText(/Depo Tahsilat Listesi/i).count();
  log('S5:supplier-payment-list-heading', heading > 0, `count=${heading}`);
  await page.screenshot({ path: OUT + '/supplier-payments.png', fullPage: true });

  // "Ödeyen Depo" column visible
  const odeyenDepoColumn = await page.getByText(/Ödeyen Depo/i).count();
  log('S5:supplier-odeyen-depo-column', odeyenDepoColumn > 0, `count=${odeyenDepoColumn}`);

  // No pharmacy references
  const pharmacyRefs = await page.getByText(/eczane/i).count();
  log('S5:supplier-no-pharmacy-ref', pharmacyRefs === 0, `eczane mentions=${pharmacyRefs}`);

  // No Yeni Ödeme Kaydı button
  const addBtn = await page.getByRole('button', { name: /Yeni Ödeme Kaydı/i }).count();
  log('S5:supplier-no-add-payment-btn', addBtn === 0, `add btn count=${addBtn}`);

  await ctx.close();
}

// ---------- SCENARIO 6: Supplier never sees pharmacy names ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAsSupplier(page);

  // Navigate through all supplier pages and verify no pharmacy names appear
  const pages = ['/supplier', '/supplier/orders', '/supplier/shipments', '/supplier/invoices', '/supplier/payments'];
  let allClear = true;
  for (const p of pages) {
    await page.goto(BASE + p);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const pharmacyTexts = await page.getByText(/eczane/i).count();
    if (pharmacyTexts > 0) {
      allClear = false;
      console.log(`  Pharmacy text found on ${p}: ${pharmacyTexts} occurrences`);
    }
  }
  log('S6:supplier-never-sees-pharmacy', allClear, 'No pharmacy names on any supplier page');
  await page.screenshot({ path: OUT + '/supplier-all-pages-clean.png', fullPage: true });
  await ctx.close();
}

await browser.close();

const failed = results.filter(r => !r.ok);
console.log(`\n=== ÖZET: ${results.length - failed.length}/${results.length} PASS ===`);
failed.forEach(f => console.log(`  FAIL: ${f.name} — ${f.detail}`));

if (failed.length > 0) process.exit(1);
