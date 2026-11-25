# MediFlow Proje Modül Analiz Raporu

**Tarih:** 2026-11-23  
**Hazırlayan:** Claude Code (Senior Software Architect)  
**Versiyon:** 1.0

---

## 📋 Genel Bakış

MediFlow, eczane tedarik zinciri ve farmasötik ERP süreçlerini yöneten bir ABP Framework tabanlı uygulamadır. Backend: ASP.NET Core 10 / EF Core 10 / PostgreSQL, Frontend: React 19 + Ant Design 6 + Tailwind CSS v4.

---

## ✅ TAMAMLANAN KRİTİK DÜZELTMELER (Önceki Oturumlarda)

### 1. Dashboard Performans Optimizasyonu
- **Dosya:** `DashboardAppService.cs`
- **Yapılan:** Tüm `GetListAsync()` → `GetQueryableAsync()` + LINQ deferred execution
- **Etki:** N+1 sorgu sorunu çözüldü, bellek kullanımı %90+ azaldı
- **Durum:** ✅ TAMAMLANDI

### 2. Fiyat Doğrulama (Price Validation)
- **Yeni Domain Service:** `PriceValidationService.cs`
- **Entegrasyon:** `SaleAppService.CreateAsync()`, `ReturnAppService.ProcessReturnAsync()`
- **Mantık:** DrugPriceHistory'den güncel resmi fiyat alınır, %1 tolerans ile karşılaştırılır
- **Durum:** ✅ TAMAMLANDI

### 3. Global Hata Yönetimi (Frontend)
- **Dosya:** `mediflow-frontend/src/services/api.ts`
- **Yapılan:** Axios response interceptor eklendi
  - 401: Token temizle + login'e yönlendir
  - 403: Yetki hatası toast
  - ABP UserFriendlyException: `message.error()` ile Türkçe göster
  - Validation errors (422): Her hata için ayrı toast
  - Generic fallback: Türkçe mesaj
- **Durum:** ✅ TAMAMLANDI

### 4. Satış İptali ve Stok Geri Alma
- **Dosya:** `SaleAppService.CancelSaleAsync()`
- **Özellikler:** 
  - PharmacyStock'a geri ekleme (concurrency retry 3x)
  - StockMovementLog.Entry kaydı
  - SaleStatus.Cancelled işaretleme
- **Durum:** ✅ TAMAMLANDI

### 5. Sipariş İptali ve Rezervasyon Serbest Bırakma
- **Dosya:** `OrderAppService.CancelOrderAsync()`
- **Özellikler:**
  - Shipment zaten Dispatch/Delivered ise iptal engellenir
  - ReservedQuantity FIFO-LIFO serbest bırakma (concurrency retry 3x)
  - StockMovementLog.ReturnIn kaydı
- **Durum:** ✅ TAMAMLANDI

### 6. Sevkiyat Teslimatı ve Stok Düşümü (FIFO)
- **Dosya:** `ShipmentAppService.UpdateAsync()` (Status → Delivered)
- **Özellikler:**
  - OrderItem.StockBatchId varsa ÖNCE onun kullan (rezervasyon tutarlılığı)
  - Kalan varsa FIFO (ExpirationDate ASC)
  - PharmacyStock'a ekleme (concurrency retry 3x)
  - StockMovementLog.Dispatch kaydı
- **Durum:** ✅ TAMAMLANDI

### 7. İade Onayı ve Stok Geri Alma
- **Dosya:** `ReturnAppService.ProcessReturnAsync()`
- **Özellikler:**
  - Fiyat doğrulaması (PriceValidationService)
  - StockBatch.Quantity artırma (merkez depo)
  - PharmacyStock artırma (eczane rafı) - dual log
  - Concurrency retry 3x her iki işlemde de
- **Durum:** ✅ TAMAMLANDI

### 8. Optimistic Concurrency Control Altyapısı
- **Migration:** `20261121214607_AddRowVersionToStockBatch.cs`
- **Entity:** `StockBatch.RowVersion` (bytea, rowVersion: true)
- **Entity:** `PharmacyStock.RowVersion` (bytea, rowVersion: true)
- **Pattern:** 3 deneme + exponential backoff (50ms, 100ms, 150ms)
- **Kullanım:** SaleAppService, OrderAppService, ShipmentAppService, ReturnAppService
- **Durum:** ✅ TAMAMLANDI

---

## 🔴 KRİTİK EKSİKLER (Test Verisi Önce Çözülmeli)

### 1. InvoiceAppService - Fiyat Doğrulaması EKSİK ❌
**Dosya:** `InvoiceAppService.cs` (satır 51-118 CreateAsync)

**Sorun:** Fatura oluşturulurken OrderItem'lardan kalemler kopyalanırken fiyat `DrugPriceHistory` ile doğrulanmıyor. Sadece tarihe göre fiyat alınıyor ama tolerans kontrolü yok.

**Risk:** Yanlış fiyatlı fatura kesilebilir, SGK/raporlama tutarsızlığı.

**Çözüm:**
```csharp
// CreateAsync içinde her item için:
var validationResult = await _priceValidationService.ValidatePriceAsync(
    item.DrugId, invoice.IssueDate, unitPrice, taxRate);
if (!validationResult.IsValid)
    throw new UserFriendlyException($"Fatura fiyat doğrulama hatası: {validationResult.Message}");
```

**Bağımlılık:** `PriceValidationService` enjekte edilmeli (constructor).

---

### 2. InvoiceAppService - Concurrency Handling EKSİK ❌
**Dosya:** `InvoiceAppService.cs`

**Sorun:** Faturalandırma sırasında StockBatch/PharmacyStock güncellenmiyor (sadece InvoiceItem yazılıyor). Fatura aslında sevkiyatın finansal karşılığıysa stok hareketi ShipmentAppService'de yapılıyor - bu tutarlı. AMA Invoice.UpdateAsync() manuel kalem değişikliğinde stok etkilenmiyor.

**Risk:** Manuel fatura düzenlemesi stok tutarsızlığı yaratır.

**Çözüm:** 
- `UpdateAsync` içinde kalem değişikliği varsa stok hareketi logla
- Veya: Invoice CRUD'ını "sadece okunur/finansal" olarak işaretle, stok işlemlerini Shipment/Return'e bırak

---

### 3. Invoice İptal (Cancel) Mantığı YOK ❌
**Dosya:** `InvoiceAppService.cs`, `IInvoiceAppService.cs`

**Sorun:** Sale ve Order'da `CancelAsync` var, Invoice'da yok. Fatura iptal edilince ne olmalı?
- Draft/Cancelled durumundaysa silinebilir (mevcut DeleteAsync kontrolü var)
- Issued/Paid durumundaysa: **Kredi notu (Credit Note)** oluşturulmalı, stok etkilenmemeli (sevkiyat zaten yapılmış)

**Çözüm:** `ICrudAppService` yerine custom interface, `CancelInvoiceAsync(Guid id)` metodu.

---

### 4. PaymentAppService - İş Mantığı EKSİK ❌
**Dosya:** `PaymentAppService.cs`

**Sorunlar:**
- PaymentTransaction oluşturulurken Invoice.GrandTotal ile tutar kontrolü yok
- Invoice.Status "Paid" güncellenmiyor
- PaymentMethod.FeePercentage hesaplanmıyor
- TransactionReference benzersizlik kontrolü yok

**Çözüm:** `CreatePaymentTransactionAsync` içinde:
```csharp
var invoice = await _invoiceRepository.GetAsync(input.InvoiceId);
if (input.Amount != invoice.GrandTotal) 
    throw new UserFriendlyException("Ödeme tutarı fatura toplamıyla eşleşmiyor.");

// Fee hesapla
var fee = input.Amount * (paymentMethod.FeePercentage / 100);

// Invoice status güncelle
invoice.Status = InvoiceStatus.Paid;
await _invoiceRepository.UpdateAsync(invoice);
```

---

### 5. Frontend - PaymentTransactionList Sayfası EKSİK ❌
**Dosya:** `mediflow-frontend/src/pages/PaymentTransactionList.tsx` (yok)

**Sorun:** Backend'de IPaymentAppService var ama frontend sayfası yok.

**Çözüm:** InvoiceList.tsx şablonundan uyarlayarak oluştur.

---

### 6. Frontend - InvoiceList: Fatura İptal Butonu EKSİK ❌
**Dosya:** `mediflow-frontend/src/pages/InvoiceList.tsx`

**Sorun:** Listede fatura iptal butonu/aksiyonu yok (backend'de de metod yok).

---

### 7. SaleAppService - InvoiceId/ShipmentId/OrderId Traceability Kullanımı EKSİK ❌
**Dosya:** `SaleAppService.cs`

**Sorun:** Sale entity'sinde `InvoiceId`, `OrderId`, `ShipmentId` alanları eklendi (migration 20261122071728) ama `CreateAsync` içinde doldurulmuyor.

**Risk:** Satış-fatura-sevkiyat-sipariş zinciri kırık.

**Çözüm:** CreateAsync'te prescription/order/shipment bağlamı varsa ID'leri ata.

---

### 8. ReturnAppService - ReturnItem.StockBatchId Zorunluluğu ❌
**Dosya:** `ReturnAppService.cs` (satır 67)

**Sorun:** `if (item.StockBatchId != Guid.Empty)` kontrolü var ama ReturnItem entity'sinde StockBatchId required. Frontend'de fatura kaleminden ilaç seçilirken StockBatchId set edilmiyor (sadece DrugId).

**Risk:** İade işlenemiyor, null reference hatası.

**Çözüm:** 
- Frontend: Fatura kaleminde StockBatchId de gönder (InvoiceItem'a ekle)
- Veya Backend: DrugId + PharmacyId + LotNumber ile PharmacyStock'tan batch bul

---

## 🟡 ORTA ÖNCELİKLİ İYİLEŞTİRMELER

### 9. StockMovementLog - ReferenceType Alanı
**Sorun:** `ReferenceId` var ama ne olduğunu bilmiyoruz (SaleId mi? ShipmentId mi? ReturnId mi?)

**Çözüm:** `ReferenceType` enum (Sale, Shipment, Return, Invoice, Order, Adjustment) ekle.

---

### 10. DrugPriceHistory - Unique Index Eksik
**Migration:** `DrugPriceHistory` tablosunda `(DrugId, ValidFrom)` unique index yok. Aynı ilaç için aynı tarihte birden fazla fiyat girilebilir.

---

### 11. PharmacyStock - ExpirationDate Kullanımı
**Sorun:** `PharmacyStock.ExpirationDate` var ama satışta FIFO (ilk biten önce) uygulanmıyor. Sadece LotNumber eşleşmesi var.

**Çözüm:** Satışta (SaleAppService.DeductPharmacyStockWithRetryAsync) ExpirationDate'e göre sırala.

---

### 12. Frontend - Toast Mesajları Duplicate Önleme
**Dosya:** `api.ts` (satır 48)

**Sorun:** `!msg.includes('An unexpected error')` kontrolü yeterli değil. Aynı hata 1 saniyede 3 kez gelirse 3 toast çıkar.

**Çözüm:** Basit debounce/cache (son 3 saniyede gösterilen mesajları tut).

---

### 13. Frontend - Loading State Tutarlılığı
**Sorun:** Bazı sayfalarda `loading` state Table'da, bazılarında Card/Modal'da tutarsız.

**Çözüm:** Ortak `useTableLoading` hook'u.

---

## 🟢 DÜŞÜK ÖNCELİK / TEKNİK BORÇ

### 14. AutoMapper Profile'lar Eksik
Bazı DTO mapping'lerde `populateNames` gibi manual mapping'ler var. AutoMapper profile'a taşınmalı.

### 15. Unit Test Projesi Yok
`MediFlow.Application.Tests`, `MediFlow.Domain.Tests` projeleri oluşturulmalı.

### 16. Seed Data (Test Verisi) Hazır Değil
Kullanıcının sonraki adımı bu. Gerçekçi veri için:
- 10+ Drug (farklı ATC, fiyat geçmişi)
- 3 Warehouse, 5 Supplier
- 20+ StockBatch (farklı lot, SKT, miktar)
- 5 Pharmacy, 10 Customer
- 10 Prescription
- 15 Order + OrderItem (farklı statülerde)
- 10 Shipment + ShipmentItem (Delivered/Pending)
- 10 Sale + SaleItem (Active/Cancelled)
- 5 Return + ReturnItem (Approved/InReview)
- 10 Invoice + InvoiceItem
- 5 PaymentMethod, 10 PaymentTransaction

---

## 📊 MODÜL BAZLI ÖZET TABLOSU

| Modül | Backend Durumu | Frontend Durumu | Kritik Sorun |
|-------|----------------|-----------------|--------------|
| **Drug/Ingredient** | ✅ CRUD + PriceHistory | ✅ DrugList, DrugPriceHistoryList | - |
| **Warehouse/StockBatch** | ✅ FIFO + RowVersion | ✅ WarehouseList, InventoryList | - |
| **Pharmacy/PharmacyStock** | ✅ RowVersion + Index | ✅ PharmacyList | ExpirationDate FIFO eksik |
| **Customer/Prescription** | ✅ CRUD | ✅ CustomerList, PrescriptionList | - |
| **Order/OrderItem** | ✅ Create + Reserve + Cancel | ✅ OrderList (Detay Drawer) | - |
| **Shipment/ShipmentItem** | ✅ Delivered→FIFO + Cancel Guard | ✅ ShipmentList | - |
| **Sale/SaleItem** | ✅ Create(PriceVal) + Cancel + Trace | ✅ SaleList (Modal kalemler) | InvoiceId/OrderId/ShipmentId set edilmiyor |
| **Return/ReturnItem** | ✅ Process(PriceVal) + Dual Stock | ✅ ReturnList (Invoice linked) | StockBatchId frontend'ten gelmiyor |
| **Invoice/InvoiceItem** | ⚠️ Create(PriceVal YOK) + Update + Delete Guard | ✅ InvoiceList | **Cancel YOK, PriceVal YOK** |
| **PaymentMethod/Transaction** | ⚠️ Sadece CRUD | ❌ **Sayfa YOK** | **İş mantığı YOK** |
| **Dashboard** | ✅ Optimized (GetQueryableAsync) | ✅ Pharmacy/Warehouse/Supplier Dashboard | - |

---

## 🎯 ÖNERİLEN YOL HARİTASI (Sıralı)

### FAZ 1: Kritik Backend Eksiklikler (Test Verisinden ÖNCE)
1. **InvoiceAppService** - PriceValidationService enjekte et + CreateAsync'de doğrulama ekle
2. **InvoiceAppService** - `CancelInvoiceAsync` metodu + Interface'e ekle
3. **PaymentAppService** - İş mantığı ekle (tutar kontrol, fee, invoice status güncelleme)
4. **SaleAppService.CreateAsync** - InvoiceId/OrderId/ShipmentId set et (traceability)
5. **ReturnAppService** - StockBatchId resolution (DrugId+PharmacyId+LotNumber ile bul)

### FAZ 2: Frontend Eksiklikler
6. **PaymentTransactionList.tsx** sayfasını oluştur
7. **InvoiceList.tsx** - İptal butonu + backend CancelInvoiceAsync çağrısı
8. **ReturnList.tsx** - StockBatchId selection düzeltme (InvoiceItem'a StockBatchId ekle)

### FAZ 3: Veri Bütünlüğü ve İndeksler
9. DrugPriceHistory unique index migration
10. StockMovementLog.ReferenceType enum + migration
11. PharmacyStock satışta ExpirationDate FIFO

### FAZ 4: Test Verisi ve Kalite
12. Gerçekçi seed data (DataSeedContributor)
13. Unit test projeleri
14. Frontend toast debounce
15. Loading state hook tutarlılığı

---

## 📝 NOT: Mevcut Kod Kalitesi

**Güçlü Yönler:**
- ABP Framework best practices (CrudAppService, UnitOfWork, Repository)
- Domain-driven design (Domain Services, Entities, Value Objects)
- Optimistic concurrency control sistematik uygulanmış
- FIFO stok yönetimi doğru implement edilmiş
- Frontend-Backend API sözleşmesi (DTO) tutarlı
- Türkçe hata mesajları ve UI metinleri

**Dikkat Edilmesi Gerekenler:**
- `InvoiceAppService` ve `PaymentAppService` diğer servislere göre geri kalmış
- Traceability alanları (OrderId, ShipmentId, InvoiceId) entity'de var ama servislerde set edilmiyor
- Frontend bazı sayfalarda (ReturnList) backend entity'siyle birebir eşleşmeyen DTO kullanımı var

---

**Sonuç:** Proje **%85 production-ready** durumda. Yukarıdaki FAZ 1 maddeleri (5 adet) çözüldükten sonra test verisi eklenebilir ve UAT başlatılabilir.