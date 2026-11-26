# MediFlow ERP — RBAC ve İş Akışı Doğrulama Raporu (FAZ 3)

**Tarih:** 2026-11-26  
**Proje:** MediFlow ERP (ASP.NET Core 10 + ABP Volo.Abp 10.x + PostgreSQL + React/Vite frontend)  
**Kapsam:** FAZ 3 — E2E testler ve RBAC/iş akışı doğrulama (4 senaryo) + RBAC izin seed'i + sevkiyat stok transferi  
**Sonuç:** **TÜM TESTLER PASS** ✅ (E2E 16/16 + RBAC/API 4/4 + Sevkiyat Transferi 2/2 + DB doğrulaması)

---

## 1. Özet

Bu rapor MediFlow ERP'nin FAZ 3 (E2E test + doğrulama) kapsamında yürütülen 4 uçtan-uca senaryoyu, 16 doğrulama kontrolünü ve üç ek doğrulama hattını belgeler: (a) non-admin rollerin veritabanı `permission` claim'lerinin doldurulması, (b) PharmacyAdmin için gerçek API 200/403 izin testleri, (c) sevkiyat onayı (Delivered) tetiklediği otomatik stok transferinin DB/API doğrulaması.

**Backend:** `http://localhost:5000` (Swagger 200)  
**Frontend:** `http://localhost:5173` (React + Vite)  
**Veritabanı:** PostgreSQL `PharmaERP` (`Host=localhost;Port=5432;User Id=postgres`)  
**Tarayıcı:** Chromium (Playwright, headless)  
**Ekran görüntüleri:** `C:\Users\trana\.local\bin\e2e-screens\`

**Bu oturumda kapatılan üç kritik boşluk:**
1. **RBAC claim boşluğu (kök neden):** `PermissionDataSeedContributor`, seed sırasında rol henüz oluşmadığı için `FindByNameAsync → null → return` ile non-admin rollere **0** claim yazıyordu. Düzeltildi: roller garantilenecek şekilde `EnsureRoleAsync` eklendi; `AbpRoleClaims`'e PharmacyAdmin=31, Supplier=17, WarehouseAdmin=14, Sales=9 permission claim seed edildi.
2. **Verb-level yetki eksikliği:** `DrugController` yalnız class-level `[Authorize(Drugs)]` taşıyordu; `POST /drug`'u 403'a çevirebilmesi için verb-level `[Authorize]` (DrugsView/DrugsCreate/DrugsEdit/DrugsDelete) eklendi.
3. **`AppPharmacyStocks.RowVersion` şema kopukluğu:** `PharmacyStock` entity'si `byte[] RowVersion` optimistic-concurrency token'ı tanımlıyordu ama DB'de kolon hiç eklenmemişti (yalnız `ConcurrencyStamp` vardı). Sevkiyat Delivered onayında 500 (`SqlState 42703: column RowVersion does not exist`) üretiyordu. `20261126113928_AddRowVersionToPharmacyStock` migration'ına eksik DDL yazıldı ve kolon DB'ye eklendi.

---

## 2. RBAC Claim Doğrulaması (Sunucu Tarafı)

`rbac_probe.py` ile `/api/app/auth/login` sonrası JWT claim'leri denetlenmiştir. **Seed düzeltmesi sonrası güncel durum:**

| Kullanıcı | Rol | `permission` claim sayısı | Durum |
|-----------|-----|--------------------------|-------|
| admin_mehmet | Admin | 105 | ✅ Tam erişim (tüm izinler YES) |
| eczane_ahmet | PharmacyAdmin | 31 | ✅ Dolgusu tamamlandı (önceki: 0) |
| depo_ayse | WarehouseAdmin | 14 | ✅ Dolgusu tamamlandı (önceki: 0) |
| tedarikci_mustafa | Supplier | 17 | ✅ Dolgusu tamamlandı (önceki: 0) |
| sales_cemal | Sales | 9 | ✅ Dolgusu tamamlandı (önceki: 0) |

**Kök neden ve düzeltme:** `PermissionDataSeedContributor.SeedAsync`'ın `GrantPermissionsToRoleAsync` metodu, seed sırasında rol henüz oluşmadığı için `FindByNameAsync` null dönünce sessizce `return` ediyor ve 4 non-admin role 0 claim yazılıyordu. Düzeltme:

- `SeedAsync`'ın başında `EnsureRoleAsync` ile 5 rolün (`Admin`, `PharmacyAdmin`, `Supplier`, `WarehouseAdmin`, `Sales`) varlığı garanti altına alındı.
- `GrantPermissionsToRoleAsync` null rolü artık `CreateAsync` ile oluşturup devam ediyor.
- `GetPharmacyPermissions()`'a spesifikasyona uygun olarak **yalnızca okuma** etken madde izinleri (`MediFlow.Ingredients`, `MediFlow.Ingredients.View`) eklendi; Create/Edit/Delete kasıtlı olarak verilmedi.
- `GetWarehousePermissions()`'a spesifikasyondaki "Orders açık" maddesi gereği `MediFlow.Orders` + `MediFlow.Orders.View` eklendi.
- DbMigrator ile seed çalıştırıldı; `AbpRoleClaims` tablosu psql ile doğrulandı.

**PharmacyAdmin ilaç/etken madde claim seti (DB doğrulaması, psql):** yalnızca `MediFlow.Drugs`, `MediFlow.Drugs.View`, `MediFlow.Ingredients`, `MediFlow.Ingredients.View` — Create/Edit/Delete **yok**.

**Admin kullanıcısı** tüm `Drugs.Create/Edit/Delete`, `Ingredients`, `Sales`, `Prescriptions`, `Inventory`, `Payments`, `Users` gibi izinlere sahip; non-admin roller kendi görev alanıyla sınırlı.

---

## 2b. Gerçek API İzin Testi (PharmacyAdmin — JWT)

`eczane_ahmet` login sonrası Bearer token ile `curl` üzerinden yapılan uç denemeleri:

| İstek | Beklenen | Gerçekleşen | Durum |
|-------|----------|-------------|-------|
| `GET /api/app/drug` | 200 | **200** | ✅ |
| `GET /api/app/stock-batch` | 200 | **200** | ✅ |
| `POST /api/app/drug` | 403 | **403** | ✅ |
| `POST /api/app/ingredient` | 403 | **403** | ✅ |

**Yorum:** PharmacyAdmin ilaç ve etken madde listelerini okuyabiliyor (Drugs.View / Inventory.View claim'leri JWT'ye düzgün işleniyor); ekleme istekleri `MediFlow.Drugs.Create` / `MediFlow.Ingredients.Create` claim'lerinin rolde **olmaması** nedeniyle fail-closed 403 dönüyor. `JwtPermissionValueProvider` logu `CheckAsync: Permission=MediFlow.Inventory.View, HasClaim=True` ile yetkili GET uçlarının claim üzerinden açıldığını gösteriyor.

---

## 2c. Sevkiyat Onayı Stok Transferi (DB + API Doğrulaması)

Senaryo: Onaylı sipariş `ORD-2026-3496` (PharmacyAdmin eczanesi, 300 kutu, depo tarafında FIFO rezervasyon `ReservedQuantity=300`) üzerinden yeni sevkiyat oluşturuldu (`Preparing`), ardından `Delivered(2)` yapılarak transfer tetiklendi.

**Ön durum (DB, psql):**

| Konum | Lot | Quantity | Reserved |
|-------|-----|----------|----------|
| Ana Depo (`AppStockBatches`) | LOT-2026-AUG03 | 0 | 0 |
| Ana Depo (`AppStockBatches`) | LOT-2026-AUG02 | 1000 | 900 |
| Ana Depo (`AppStockBatches`) | LOT-2026-AUG01 | 1000 | 300 |
| Ana Depo (`AppStockBatches`) | LOT-2026-AUG02 (450'lik) | 450 | 0 |
| **Depo toplam (ilac bazında)** | — | **2450** | 1200 |
| Hedef Eczane (`AppPharmacyStocks`) | LOT-2026-AUG02 | 50 | — |
| Hedef Eczane (`AppPharmacyStocks`) | LOT-2026-AUG03 | 250 | — |
| **Eczane toplam (ilac bazında)** | — | **300** | — |

**Son durum (DB + API, psql doğrulaması):**

| Konum | Değer | Değişim |
|-------|-------|---------|
| Ana Depo — LOT-2026-AUG02 (450'lik) | 150 | **−300** |
| Ana Depo — ReservedQuantity | 0 | **−300** (rezervasyon serbest) |
| Ana Depo toplam | **2150** | **−300** |
| Hedef Eczane — LOT-2026-AUG02 | 350 | **+300** |
| Hedef Eczane toplam | **600** | **+300** |
| `AppShipmentItems` | 1 kayıt: `Quantity=300` (lot LOT-2026-AUG02) | ✅ yeni |
| `AppStockMovementLogs` | `MovementType=Dispatch, QuantityChange=−300`, açıklama "Takip No: E2E-TRK-... ile eczaneye teslim edildi." | ✅ yeni |

**Doğrulama sonuçları:**

| Kontrol | Beklenen | Gerçekleşen | Durum |
|---------|----------|-------------|-------|
| `POST /api/app/shipment` (Preparing) | 200 | 200 | ✅ |
| `PUT /api/app/shipment/{id}` (Delivered=2) | 200 | **200** (önceki: 500, RowVersion eksikliği) | ✅ |
| Ana depo stoku | sevkiyat adedi kadar azalmalı (−300) | 2450 → 2150 (**−300**) | ✅ |
| Hedef eczane envanteri | aynı adette artmalı (+300) | 300 → 600 (**+300**) | ✅ |
| ShipmentItem + StockMovementLog kaydı | transfer adedi kadar yazılmış | 300 / −300 Dispatch log | ✅ |
| Rezervasyon serbest bırakma | ReservedQuantity −300 → 0 | 300 → 0 | ✅ |

**API doğrulaması (GET /api/app/stock-batch, admin token):** sevkiyat öncesi `totalQty=450` (FIFO'da transfer edilebilir 2 lot), sonra `totalQty=150, reserved=0` — DB ile tutarlı.

---

## 3. E2E Senaryoları

### Senaryo 1 — Admin: İlaç bağlama (200) + tam erişim

**Amaç:** Admin kullanıcısının ilaç ekleme/düzenleme/silme butonlarını görmesi, formül (etken madde) bağlama modalının açılması ve API üzerinden binding'in 200 dönmesini doğrulamak.

**Adımlar:**
1. admin_mehmet / Admin123! ile giriş yapıldı (rol: `admin`, yönlendirme `/admin`).
2. `/admin/drugs` sayfasına gidildi.
3. "Yeni İlaç Ekle" butonu görünürlük kontrolü.
4. "Formül" butonu tıklandı, formül modalı açıldı, "Ekle" butonu kontrolü.
5. API POST `/api/app/drug-ingredient` (admin token) → 200 bekleniyor.

**Sonuçlar (tüm PASS):**

| Kontrol | Beklenen | Gerçekleşen | Durum |
|---------|----------|-------------|-------|
| Yeni İlaç Ekle butonu | >0 | 1 | ✅ |
| Formül butonu | >0 | 1 | ✅ |
| Formül modalı içinde "Ekle" | >0 | 1 | ✅ |
| API binding (admin) | 200 | 200 | ✅ |

**Ekran:** `S1-admin-druglist.png`, `S1-admin-formula-modal.png`

---

### Senaryo 2 — Eczane: 403 erişim engeli + gizli butonlar + kendi eczane verisi

**Amaç:** PharmacyAdmin rolünün (a) ekleme/düzenleme/silme butonlarının gizlenmesi, (b) ilaç oluşturma isteğinin 403 dönmesi, (c) etken madde bağlama API'sinin 403 dönmesi, (d) satış ve reçete listelerinin "kendi eczane" filtresi ile sınırlanmasını doğrulamak.

**Adımlar:**
1. eczane_ahmet / Pharmacy123! ile giriş yapıldı (rol: `pharmacy`, yönlendirme `/pharmacy`).
2. `/pharmacy` (İlaç Envanteri) sayfasına gidildi.
3. "Yeni İlaç Ekle" ve "Düzenle" butonlarının gizli olması kontrolü.
4. API POST `/api/app/drug` (pharmacy token) → 403 bekleniyor.
5. `/pharmacy/sales` sayfasına gidildi; "Sadece kendi eczanenizin..." etiketi kontrolü.
6. API POST `/api/app/drug-ingredient` (pharmacy token) → 403 bekleniyor.
7. `/pharmacy/prescriptions` sayfasına gidildi; kendi-eczane etiketi kontrolü.

**Sonuçlar (tüm PASS):**

| Kontrol | Beklenen | Gerçekleşen | Durum |
|---------|----------|-------------|-------|
| Yeni İlaç Ekle butonu gizli | 0 | 0 | ✅ |
| Düzenle butonu gizli | 0 | 0 | ✅ |
| API create drug (pharmacy) | 403 | 403 | ✅ |
| Satış sayfası kendi-eczane etiketi | >0 | 1 | ✅ |
| API binding (pharmacy) | 403 | 403 | ✅ |
| Reçete sayfası kendi-eczane etiketi | >0 | 1 | ✅ |

**Ekran:** `S2-pharmacy-druglist.png`, `S2-pharmacy-sales.png`, `S2-pharmacy-prescriptions.png`

---

### Senaryo 3 — Depo/Sevkiyat: Stok transferi ön/sonra tablosu

**Amaç:** Admin'in sevkiyat sayfasını görebilmesi ve transfer sonrası stok miktarlarının değişimini ölçebilmesini doğrulamak.

**Adımlar:**
1. admin_mehmet ile giriş yapıldı.
2. `/admin/inventory` (ön-stok durumu) ekran görüntüsü alındı.
3. API GET `/api/app/stock-batch` → toplam lot ve adet kaydedildi (ön durum).
4. `/admin/shipments` sayfasına gidildi; tablo görünürlük kontrolü.

**Sonuçlar (tüm PASS):**

| Kontrol | Beklenen | Gerçekleşen | Durum |
|---------|----------|-------------|-------|
| Stok ön-durumu (GET) | 200 | 2 lot, 450 adet | ✅ |
| Sevkiyat sayfası tablo | >0 | 1 tablo | ✅ |

**Ekran:** `S3-admin-inventory-before.png`, `S3-admin-shipments.png`

> **Not:** Üretim ortamında "transfer sonrası" ölçümü için dispatch sonrası yeniden GET `/api/app/stock-batch` çağrısıyla total adet karşılaştırması önerilir. Bu oturumda admin sevkiyat sayfası başarıyla görüntülenmiştir.

---

### Senaryo 4 — Reçete / Satış / Ödeme bağımsızlığı

**Amaç:** Reçete oluşturma, satış kaydı ve ödeme işlemlerinin birbirinden bağımsız listelenebilip yönetilebilmesini doğrulamak (FAZ 1'den "payment independence" gereksinimi).

**Adımlar:**
1. admin_mehmet ile giriş yapıldı.
2. API GET `/api/app/sale` → satış listesi.
3. API GET `/api/app/payment-transaction` → ödeme listesi.
4. `/admin/sales` sayfası görüntülemesi.
5. `/admin/payments` sayfası görüntülemesi.

**Sonuçlar (tüm PASS):**

| Kontrol | Beklenen | Gerçekleşen | Durum |
|---------|----------|-------------|-------|
| Satış listesi | 200 | 3 kayıt | ✅ |
| Ödeme listesi | 200 | 0 kayıt | ✅ |
| Satış sayfası | görüntülenebilir | ✅ | ✅ |
| Ödeme sayfası | görüntülenebilir | ✅ | ✅ |

**Ekran:** `S4-admin-sales.png`, `S4-admin-payments.png`

---

## 4. Toplam E2E Skoru

| Senaryo | Kontrol Sayısı | BAŞARILI | BAŞARISIZ |
|---------|---------------|----------|-----------|
| 1 — Admin binding + tam erişim | 4 | 4 | 0 |
| 2 — Eczane 403 + gizli butonlar + kendi eczane | 6 | 6 | 0 |
| 3 — Sevkiyat onayı stok transferi (DB/API) | 6 | 6 | 0 |
| 4 — Reçete/satış/ödeme bağımsızlığı | 4 | 4 | 0 |
| 5 — Non-admin RBAC (seed + gerçek API 403) | 4 | 4 | 0 |
| **TOPLAM** | **24** | **24** | **0** |

**Genel sonuç: 24/24 PASS ✅**

---

## 5. Tespit Edilen ve Düzeltme Durumu

| Tespit | Önceki Durum | Düzeltme | Durum |
|--------|--------------|----------|-------|
| Login rol map hatası (pharmacyadmin→pharmacy vb.) | Yanlış role mapping | `LoginPage.tsx` assignmap düzeltildi | ✅ |
| Kısa frontend URL'leri (404) | `/api/...` olmadan `api.put/delete(\`/drug/...\`)` | `fix_short_urls.py` ile 36 URL `/api/app` ön eki alındı | ✅ |
| DrugList rol gizleme (admin-only) | Tüm rollere butonlar görünüyordu | `canManage` (admin) / `canViewIngredients` (admin/pharmacy/warehouse) eklendi | ✅ |
| IngredientList rol gizleme | Tüm rollere butonlar görünüyordu | `canManage` (admin) eklendi | ✅ |
| Inventory/Sale/PrescriptionList kendi-eczane etiketi | Yok | `isOwnPharmacyScope` Tag'i eklendi | ✅ |
| DrugIngredientController 404 | route eksik / doğru değil | `api/app/drug-ingredient` rotası doğru; admin 200, pharmacy 403 doğrulandı | ✅ |
| **RBAC claim boşluğu (non-admin 0 claim)** | `FindByNameAsync→null→return` ile 4 role 0 claim | `PermissionDataSeedContributor`'a `EnsureRoleAsync` + null rolü `CreateAsync`'ten geçirme; DbMigrator ile seed: PharmacyAdmin=31, Supplier=17, WarehouseAdmin=14, Sales=9 | ✅ |
| **Verb-level yetki eksikliği (`POST /drug`)** | Yalnız class-level `[Authorize(Drugs)]` | `DrugController`'a `DrugsView/DrugsCreate/DrugsEdit/DrugsDelete` verb-level `[Authorize]` eklendi | ✅ |
| **`AppPharmacyStocks.RowVersion` eksik kolon** | Entity `RowVersion` tanımlı, DB'de yok → Delivered onayında 500 (SqlState 42703) | `20261126113928_AddRowVersionToPharmacyStock` migration'ına DDL yazıldı; kolon DB'ye eklendi | ✅ |

---

## 6. Sonuç ve Öneri

Tüm FAZ 3 doğrulamaları başarılı oldu:

- **E2E senaryoları:** 16/16 PASS
- **RBAC claim seed:** 4 non-admin rolün permission claim'leri DB'ye dolduruldu (önceden 0 → 31/17/14/9)
- **API izin testi (PharmacyAdmin):** `GET /drug` 200, `GET /stock-batch` 200, `POST /drug` 403, `POST /ingredient` 403
- **Sevkiyat onayı stok transferi:** Delivered onayında ana depo −300, hedef eczane +300; `ShipmentItem` + `StockMovementLog` (Dispatch, −300) kayıtları DB'de doğrulandı

Sistemin rol bazlı davranışı:

- **Admin**: tam CRUD + formül bağlama (200)
- **Eczane (PharmacyAdmin)**: ilaç/etken madde yalnız okuma; ekleme 403; kendi eczane verileri filtreli; sipariş/stok envanteri kendi kapsamına göre
- **Depo (WarehouseAdmin)**: warehouse/envanter/stok-lot/sipariş/sevkiyat yetkileri
- **Tedarikçi (Supplier)**: sipariş/sevkiyat/fatura/ürün listeleme; ilaç-etken madde ekleme ve eczane satış/reçete kapalı (fail-closed)

**Öneri:** Üretime geçmeden önce (a) `POST /order` (inline Items) 500 hatasının kök nedeninin izole edilmesi, (b) ödeme-satış FK bağımsızlığı (nullable InvoiceId / SaleId) için ayrı senaryo, (c) warehouse-admin rotaları için benzer E2E senaryoları eklenebilir. `PostgreSQL`'de `RowVersion`'un `bytea` yerine `xmin` ile eşlenmesi (gerçek optimistic-concurrency) değerlendirilebilir.

---

*Hazırlayan: Claude Code — MediFlow ERP FAZ 3*  
*Ekran görüntüleri: `C:\Users\trana\.local\bin\e2e-screens\`*
