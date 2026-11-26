// Debug: ilaç/etken madde/bağ API durumu + Formül modal davranışı
import { chromium } from 'playwright';

const OUT = 'C:/Users/trana/.local/bin/e2e-screens';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });

async function loginToken(user, pass) {
  const res = await fetch('http://localhost:5000/api/app/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: user, password: pass })
  });
  return (await res.json()).accessToken;
}

const t = await loginToken('admin_mehmet', 'Admin123!');
const H = { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' };

const get = async (u) => {
  const r = await fetch(`http://localhost:5000${u}`, { headers: H });
  let b; try { b = await r.json(); } catch { b = await r.text(); }
  return { status: r.status, body: b };
};

console.log('--- API DURUMU (admin) ---');
console.log('GET /api/app/drug:', JSON.stringify((await get('/api/app/drug')).body?.items?.length ?? (await get('/api/app/drug')).body));
const drugRes = await get('/api/app/drug');
const ingRes = await get('/api/app/ingredient');
const diRes = await get('/api/app/drug-ingredient');
console.log('GET /api/app/drug status:', drugRes.status, 'items:', drugRes.body?.items?.length ?? drugRes.body);
console.log('GET /api/app/ingredient status:', ingRes.status, 'items:', ingRes.body?.items?.length ?? ingRes.body);
console.log('GET /api/app/drug-ingredient status:', diRes.status, 'items:', diRes.body?.items?.length ?? JSON.stringify(diRes.body).slice(0, 200));

// Admin binding (200 doğrulaması)
const drugs = drugRes.body?.items || [];
const ings = ingRes.body?.items || [];
if (drugs.length && ings.length) {
  const post = await fetch('http://localhost:5000/api/app/drug-ingredient', {
    method: 'POST', headers: H,
    body: JSON.stringify({ drugId: drugs[0].id, ingredientId: ings[0].id, amount: 50, unit: 'mg' })
  });
  console.log('POST /api/app/drug-ingredient (admin) status:', post.status, await post.text().then(x => x.slice(0, 150)));
} else {
  console.log('Binding testi için ilaç/etken madde yok');
}

// Pharmacy binding denemeleri (403 doğrulaması)
const t2 = await loginToken('eczane_ahmet', 'Pharmacy123!');
const H2 = { Authorization: `Bearer ${t2}`, 'Content-Type': 'application/json' };
const g2 = await fetch('http://localhost:5000/api/app/drug-ingredient', { headers: H2 });
console.log('GET /api/app/drug-ingredient (pharmacy) status:', g2.status, await g2.text().then(x => x.slice(0, 150)));
if (drugs.length && ings.length) {
  const p2 = await fetch('http://localhost:5000/api/app/drug-ingredient', {
    method: 'POST', headers: H2,
    body: JSON.stringify({ drugId: drugs[0].id, ingredientId: ings[0].id, amount: 50, unit: 'mg' })
  });
  console.log('POST /api/app/drug-ingredient (pharmacy) status:', p2.status, await p2.text().then(x => x.slice(0, 150)));
}

// --- Tarayıcı: Formül modal davranışı ---
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto('http://localhost:5173/login');
await page.fill('input[autocomplete="username"]', 'admin_mehmet');
await page.fill('input[autocomplete="current-password"]', 'Admin123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
await page.goto('http://localhost:5173/admin/drugs');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);

const rowCount = await page.locator('.ant-table-tbody tr[data-row-key]').count();
console.log('DrugList tablo satır sayısı:', rowCount);
await page.screenshot({ path: OUT + '/debug-admin-drugs.png', fullPage: true });

if (rowCount > 0) {
  await page.locator('.ant-table-tbody tr[data-row-key] button:has-text("Formül")').first().click();
  await page.waitForTimeout(1500);
  const modalOpen = await page.locator('.ant-modal:visible').count();
  const ekleBtn = await page.locator('.ant-modal button:has-text("Ekle")').count();
  console.log('Modal açık:', modalOpen, '| Modal içinde Ekle butonu:', ekleBtn);
  await page.screenshot({ path: OUT + '/debug-admin-formula-modal.png' });
}

await browser.close();
