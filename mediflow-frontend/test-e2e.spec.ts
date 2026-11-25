import { test, expect } from '@playwright/test';

test.describe('MediFlow ERP Tek Tıkla Gezinme Testi', () => {
  const BASE_URL = 'http://localhost:5173';

  test('Menülere tek tıklandığında sayfa içeriği anında yüklenmeli', async ({ page }) => {
    const networkErrors: { url: string; status: number }[] = [];

    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/') && status >= 400) {
        networkErrors.push({ url, status });
      }
    });

    // 1. Giriş
    await page.goto(BASE_URL);
    await expect(page.locator('text=MediFlow ERP').first()).toBeVisible();

    await page.fill('input[placeholder*="Orn:"]', 'admin_mehmet');
    await page.fill('input[placeholder*="••••"]', 'Admin123!');
    await page.click('button:has-text("Giris Yap")');
    await page.waitForURL('**/admin', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 2. Her menüye SADECE 1 KEZ tıkla
    const menuItems = ['İlaç Envanteri', 'Siparişler', 'Reçeteler', 'Satışlar (POS)'];
    for (const item of menuItems) {
      console.log(`Test ediliyor: ${item}`);
      const menuItem = page.locator(`.ant-menu-item:has-text("${item}")`);
      await menuItem.waitFor({ state: 'visible', timeout: 5000 });
      await menuItem.click({ force: true });

      // Sayfanın yüklendiğini bekle (kısa bir bekleme)
      await page.waitForTimeout(1000);

      // Tablo veya kart görünür mü?
      const content = page.locator('.ant-table, .ant-card').first();
      await expect(content).toBeVisible({ timeout: 5000 });
    }

    console.log('\nNetwork Hataları:', networkErrors);
    expect(networkErrors.filter(e => e.status === 401 || e.status === 403 || e.status === 500).length).toBe(0);
  });
});
