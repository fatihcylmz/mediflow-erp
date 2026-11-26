using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediFlow.Customers;
using MediFlow.Drugs;
using MediFlow.Inventories;
using MediFlow.Invoices;
using MediFlow.Orders;
using MediFlow.Pharmacies;
using MediFlow.Prescriptions;
using MediFlow.Pricing;
using MediFlow.Sales;
using MediFlow.Shipments;
using MediFlow.Suppliers;
using MediFlow.Warehouses;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.MultiTenancy;
using Volo.Abp.Uow;

namespace MediFlow.DataSeedContributors;

/// <summary>
/// Eczane tedarik zinciri sistemi için kapsamlı test verisi tohumlama katmanı.
/// Tüm ana entity'ler (ilaçlar, tedarikçiler, stok, siparişler, sevkiyatlar, faturalar, satışlar) popüle edilir.
/// </summary>
public class PharmaDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<Drug, Guid> _drugRepository;
    private readonly IRepository<Ingredient, Guid> _ingredientRepository;
    private readonly IRepository<Supplier, Guid> _supplierRepository;
    private readonly IRepository<Warehouse, Guid> _warehouseRepository;
    private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
    private readonly IRepository<Customer, Guid> _customerRepository;
    private readonly IRepository<Prescription, Guid> _prescriptionRepository;
    private readonly IRepository<Order, Guid> _orderRepository;
    private readonly IRepository<Shipment, Guid> _shipmentRepository;
    private readonly IRepository<Invoice, Guid> _invoiceRepository;
    private readonly IRepository<Sale, Guid> _saleRepository;
    private readonly IRepository<DrugPriceHistory, Guid> _priceHistoryRepository;
    private readonly IRepository<StockMovementLog, Guid> _movementLogRepository;
    private readonly IGuidGenerator _guidGenerator;
    private readonly ICurrentTenant _currentTenant;

    public PharmaDataSeedContributor(
        IRepository<Drug, Guid> drugRepository,
        IRepository<Ingredient, Guid> ingredientRepository,
        IRepository<Supplier, Guid> supplierRepository,
        IRepository<Warehouse, Guid> warehouseRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<Pharmacy, Guid> pharmacyRepository,
        IRepository<Customer, Guid> customerRepository,
        IRepository<Prescription, Guid> prescriptionRepository,
        IRepository<Order, Guid> orderRepository,
        IRepository<Shipment, Guid> shipmentRepository,
        IRepository<Invoice, Guid> invoiceRepository,
        IRepository<Sale, Guid> saleRepository,
        IRepository<DrugPriceHistory, Guid> priceHistoryRepository,
        IRepository<StockMovementLog, Guid> movementLogRepository,
        IGuidGenerator guidGenerator,
        ICurrentTenant currentTenant)
    {
        _drugRepository = drugRepository;
        _ingredientRepository = ingredientRepository;
        _supplierRepository = supplierRepository;
        _warehouseRepository = warehouseRepository;
        _stockBatchRepository = stockBatchRepository;
        _pharmacyRepository = pharmacyRepository;
        _customerRepository = customerRepository;
        _prescriptionRepository = prescriptionRepository;
        _orderRepository = orderRepository;
        _shipmentRepository = shipmentRepository;
        _invoiceRepository = invoiceRepository;
        _saleRepository = saleRepository;
        _priceHistoryRepository = priceHistoryRepository;
        _movementLogRepository = movementLogRepository;
        _guidGenerator = guidGenerator;
        _currentTenant = currentTenant;
    }

    [UnitOfWork]
    public virtual async Task SeedAsync(DataSeedContext context)
    {
        await SeedDrugsAndIngredientsAsync();
        await SeedSuppliersAsync();
        await SeedWarehousesAsync();
        await SeedStockBatchesAsync();
        await SeedPharmaciesAsync();
        await SeedCustomersAsync();
        await SeedPrescriptionsAsync();
        await SeedOrdersAndShipmentsAndInvoicesAsync();
        await SeedSalesAsync();
        await SeedPricesAsync();
        await SeedMovementsAsync();
    }

    // ─────────────────────────────────────────────────────────────────────
    // 1. İLAÇLAR VE AKTİF İÇERİKLER
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedDrugsAndIngredientsAsync()
    {
        var existingDrugs = await _drugRepository.GetListAsync();
        if (existingDrugs.Any()) return;

        // Aktif içerikler
        var ingredients = new List<(string Name, string Code)>
        {
            ("Parasetamol", "PP-001"),
            ("Ibuprofen", "IB-002"),
            ("Amoksisilin", "AM-003"),
            ("Asetilsalisilik Asit", "ASA-004"),
            ("Omeprazol", "OM-005"),
            ("Metformin", "MF-006"),
            ("Atorvastatin", "AT-007"),
            ("Enalapril", "EN-008"),
            ("Losartan", "LO-009"),
            ("Levotiroksin", "LV-010")
        };

        var createdIngredients = new Dictionary<string, Guid>();
        foreach (var (name, code) in ingredients)
        {
            var ing = new Ingredient { Name = name, Description = $"{name} aktif madde", Type = IngredientType.Active };
            await _ingredientRepository.InsertAsync(ing, autoSave: true);
            createdIngredients[name] = ing.Id;
        }

        // İlaçlar
        var drugs = new List<(string Name, string Barcode, string ATCCode, int UnitsPerBox, int MinimumStockLevel)>
        {
            ("Panadol tablet 500mg", "8691001000001", "N02BE01", 20, 50),
            ("Advil tablet 400mg", "8691001000002", "M01AE01", 30, 40),
            ("Augmentin tablet 875mg", "8691001000003", "J01CR01", 14, 30),
            ("Aspiril tablet 100mg", "8691001000004", "B01AC06", 30, 60),
            ("Prilosec kapsül 20mg", "8691001000005", "A02BC05", 28, 25),
            ("Glucophage tablet 850mg", "8691001000006", "A10BA02", 30, 35),
            ("Lipitor tablet 10mg", "8691001000007", "C10AA05", 28, 30),
            ("Renitec tablet 10mg", "8691001000008", "C09AA02", 28, 25),
            ("Cozaar tablet 50mg", "8691001000009", "C09CA01", 28, 25),
            ("Eferox tablet 50mcg", "8691001000010", "H03AA01", 30, 20)
        };

        var prices = new decimal[] { 45.50m, 38.75m, 120.00m, 22.00m, 85.50m, 65.00m, 150.00m, 95.00m, 110.00m, 55.00m };
        var taxRates = new decimal[] { 1, 1, 0, 1, 1, 0, 1, 1, 1, 1 };

        var suppliers = await _supplierRepository.GetListAsync();
        var defaultSupplierId = suppliers.FirstOrDefault()?.Id ?? Guid.Empty;

        for (int i = 0; i < drugs.Count; i++)
        {
            var d = new Drug
            {
                Name = drugs[i].Name,
                Barcode = drugs[i].Barcode,
                ATCCode = drugs[i].ATCCode,
                SupplierId = defaultSupplierId,
                Form = DrugForm.Tablet,
                Dosage = 500,
                DosageUnit = "mg",
                PrescriptionType = i == 2 ? PrescriptionType.Red : PrescriptionType.White,
                RequiresColdChain = false,
                ShelfLifeInMonths = 24,
                UnitsPerBox = drugs[i].UnitsPerBox,
                MinimumStockLevel = drugs[i].MinimumStockLevel
            };
            await _drugRepository.InsertAsync(d, autoSave: true);
        }

        // Fiyat geçmişi (her ilaç için başlangıç fiyatı)
        var today = DateTime.Today;
        var allDrugs = await _drugRepository.GetListAsync();
        for (int i = 0; i < allDrugs.Count && i < prices.Length; i++)
        {
            var drug = allDrugs[i];
            await _priceHistoryRepository.InsertAsync(new DrugPriceHistory
            {
                DrugId = drug.Id,
                Price = prices[i],
                TaxRate = taxRates[i],
                ValidFrom = today,
                ValidTo = null,
                IsCoveredByStateInsurance = taxRates[i] == 0,
                StateCoveragePercentage = 80m
            }, autoSave: true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. TEDARİKÇİLER
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedSuppliersAsync()
    {
        var existing = await _supplierRepository.GetListAsync();
        if (existing.Any()) return;

        var suppliers = new List<(string Name, string TaxNumber, string ContactName, string ContactSurname, string Phone, string Email)>
        {
            ("Abdi İbrahim İlaç", "8010001234", "Ahmet", "Yılmaz", "02121234567", "info@abdirahim.com.tr"),
            ("Biofabrika İlaç", "2910005678", "Mehmet", "Demir", "02122345678", "contact@biofabrika.com"),
            ("Eczacıbaşı Ilac", "1100009876", "Fatma", "Kaya", "02123456789", "info@eczacibasiilac.com"),
            ("Pfizer İlaç", "3450003210", "Ali", "Öztürk", "02124567890", "turkey@pfizer.com"),
            ("Novartis İlaç", "4560007890", "Zeynep", "Arslan", "02125678901", "info@novartis.com.tr")
        };

        foreach (var s in suppliers)
        {
            await _supplierRepository.InsertAsync(new Supplier
            {
                Name = s.Name,
                TaxNumber = s.TaxNumber,
                ContactName = s.ContactName,
                ContactSurname = s.ContactSurname,
                PhoneNumber = s.Phone,
                Email = s.Email
            }, autoSave: true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. DEPO
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedWarehousesAsync()
    {
        var existing = await _warehouseRepository.GetListAsync();
        if (existing.Any()) return;

        await _warehouseRepository.InsertAsync(new Warehouse
        {
            Name = "Ana Lojistik Dağıtım Merkezi",
            LocationAddress = "Tuzla, İstanbul",
            ManagerName = "Depo Yöneticisi 1",
            HasColdStorage = true
        }, autoSave: true);
        await _warehouseRepository.InsertAsync(new Warehouse
        {
            Name = "Marmara Merkez Depo",
            LocationAddress = "Gebze, Kocaeli",
            ManagerName = "Depo Yöneticisi 2",
            HasColdStorage = false
        }, autoSave: true);
        await _warehouseRepository.InsertAsync(new Warehouse
        {
            Name = "İstanbul Merkez Depo",
            LocationAddress = "Esenyurt, İstanbul",
            ManagerName = "Depo Yöneticisi 3",
            HasColdStorage = true
        }, autoSave: true);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. STOK LOTLARI (FIFO için farklı SKT'lerle)
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedStockBatchesAsync()
    {
        var existing = await _stockBatchRepository.GetListAsync();
        if (existing.Any()) return;

        var drugs = await _drugRepository.GetListAsync();
        var suppliers = await _supplierRepository.GetListAsync();
        var warehouses = await _warehouseRepository.GetListAsync();
        if (drugs.Count < 3 || suppliers.Count < 3 || !warehouses.Any()) return;

        var now = DateTime.Today;
        var batches = new List<(int DrugIdx, string LotNo, decimal Price, int Qty, DateTime ExpDate, int SupIdx, int WhIdx)>
        {
            (0, "LOT-PND-2024-001", 42.00m, 200, now.AddMonths(18), 0, 0),
            (0, "LOT-PND-2024-002", 44.50m, 150, now.AddMonths(24), 1, 1),
            (1, "LOT-ADV-2024-001", 35.00m, 120, now.AddMonths(15), 2, 0),
            (1, "LOT-ADV-2024-002", 37.25m, 80, now.AddMonths(20), 0, 2),
            (2, "LOT-AUG-2024-001", 110.00m, 60, now.AddMonths(12), 1, 1),
            (2, "LOT-AUG-2024-002", 115.50m, 90, now.AddMonths(18), 3, 2),
            (3, "LOT-ASP-2024-001", 20.00m, 300, now.AddMonths(30), 2, 0),
            (4, "LOT-PRL-2024-001", 80.00m, 100, now.AddMonths(24), 0, 1),
            (5, "LOT-MET-2024-001", 60.00m, 150, now.AddMonths(16), 3, 2),
            (6, "LOT-ATV-2024-001", 140.00m, 70, now.AddMonths(22), 4, 0),
            (7, "LOT-ENS-2024-001", 90.00m, 80, now.AddMonths(18), 1, 1),
            (8, "LOT-LOS-2024-001", 105.00m, 60, now.AddMonths(20), 2, 2),
            (9, "LOT-LVT-2024-001", 50.00m, 100, now.AddMonths(26), 4, 0)
        };

        foreach (var b in batches)
        {
            var drug = drugs[b.DrugIdx];
            var sup = suppliers[b.SupIdx];
            var wh = warehouses[b.WhIdx];

            var sb = new StockBatch
            {
                DrugId = drug.Id,
                WarehouseId = wh.Id,
                SupplierId = sup.Id,
                LotNumber = b.LotNo,
                ExpirationDate = b.ExpDate,
                Quantity = b.Qty,
                ReservedQuantity = 0,
                ShelfLocation = "A-01-R3",
                IsQuarantined = false
            };
            await _stockBatchRepository.InsertAsync(sb, autoSave: true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. ECZANELER
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedPharmaciesAsync()
    {
        var existing = await _pharmacyRepository.GetListAsync();
        if (existing.Any()) return;

        var pharmacies = new List<(string Name, string GLN, string TaxNumber, string PharmacistName, string PharmacistLicense, string Address, string Phone)>
        {
            ("Şifa Eczanesi", "8690001000001", "1234567890", "Dr. Ahmet Şifa", "PHM-001", "Kadıköy, İstanbul", "02161234567"),
            ("Hayat Eczanesi", "8690002000002", "1234567891", "Dr. Fatma Hayat", "PHM-002", "Beşiktaş, İstanbul", "02122345678"),
            ("Sağlık Eczanesi", "8690003000003", "1234567892", "Dr. Mehmet Sağlık", "PHM-003", "Üsküdar, İstanbul", "02163456789"),
            ("Güneş Eczanesi", "8690004000004", "1234567893", "Dr. Ayşe Güneş", "PHM-004", "Bakırköy, İstanbul", "02124567890"),
            ("Umman Eczanesi", "8690005000005", "1234567894", "Dr. Ali Umman", "PHM-005", "Maltepe, İstanbul", "02165678901")
        };

        foreach (var p in pharmacies)
        {
            await _pharmacyRepository.InsertAsync(new Pharmacy
            {
                Name = p.Name,
                GLN = p.GLN,
                TaxNumber = p.TaxNumber,
                PharmacistName = p.PharmacistName,
                PharmacistLicenseNumber = p.PharmacistLicense,
                Address = p.Address,
                PhoneNumber = p.Phone
            }, autoSave: true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. MÜŞTERİLER
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedCustomersAsync()
    {
        var existing = await _customerRepository.GetListAsync();
        if (existing.Any()) return;

        var customers = new List<(string Identity, string First, string Last, string Phone, DateTime Dob)>
        {
            ("12345678901", "Ahmet", "Yılmaz", "05321234567", new DateTime(1985, 5, 15)),
            ("23456789012", "Fatma", "Demir", "05332345678", new DateTime(1990, 8, 22)),
            ("34567890123", "Mehmet", "Kaya", "05343456789", new DateTime(1978, 12, 3)),
            ("45678901234", "Ayşe", "Çelik", "05354567890", new DateTime(1995, 3, 18)),
            ("56789012345", "Ali", "Öztürk", "05365678901", new DateTime(1982, 11, 30)),
            ("67890123456", "Zeynep", "Arslan", "05376789012", new DateTime(1988, 7, 9)),
            ("78901234567", "Hasan", "Koç", "05387890123", new DateTime(1975, 1, 25)),
            ("89012345678", "Elif", "Şahin", "05398901234", new DateTime(1992, 4, 12)),
            ("90123456789", "Mustafa", "Aydın", "05309012345", new DateTime(1980, 9, 7)),
            ("01234567890", "Deniz", "Yıldırım", "05310123456", new DateTime(1998, 2, 14))
        };

        foreach (var c in customers)
        {
            await _customerRepository.InsertAsync(new Customer
            {
                IdentityNumber = c.Identity,
                FirstName = c.First,
                LastName = c.Last,
                PhoneNumber = c.Phone,
                DateOfBirth = c.Dob
            }, autoSave: true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 7. REÇETELER
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedPrescriptionsAsync()
    {
        var existing = await _prescriptionRepository.GetListAsync();
        if (existing.Any()) return;

        var customers = await _customerRepository.GetListAsync();
        if (!customers.Any()) return;

        var prescriptions = new List<(string EPrepNo, string Doctor, string Diploma, string Hospital, DateTime IssueDate, int CustomerIdx)>
        {
            ("EP2024001", "Dr. Ahmet Yılmaz", "DIP-001", "Devlet Hastanesi", DateTime.Today.AddDays(-30), 0),
            ("EP2024002", "Dr. Zeynep Kara", "DIP-002", "Özel Tıp Merkezi", DateTime.Today.AddDays(-25), 1),
            ("EP2024003", "Dr. Mehmet Demir", "DIP-003", "Üniversite Hastanesi", DateTime.Today.AddDays(-20), 2),
            ("EP2024004", "Dr. Ayşe Çelik", "DIP-004", "Devlet Hastanesi", DateTime.Today.AddDays(-15), 3),
            ("EP2024005", "Dr. Ali Öztürk", "DIP-005", "Özel Tıp Merkezi", DateTime.Today.AddDays(-10), 4)
        };

        foreach (var p in prescriptions)
        {
            if (p.CustomerIdx >= customers.Count) continue;
            await _prescriptionRepository.InsertAsync(
                new Prescription
                {
                    CustomerId = customers[p.CustomerIdx].Id,
                    EPrescriptionNumber = p.EPrepNo,
                    DoctorName = p.Doctor,
                    DoctorDiplomaNumber = p.Diploma,
                    HospitalName = p.Hospital,
                    IssueDate = p.IssueDate
                }, autoSave: true
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 8. SİPARİŞ → SEVKİYAT → FATURA ZİNCİRİ (Depo bazlı B2B tedarik zinciri)
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedOrdersAndShipmentsAndInvoicesAsync()
    {
        var orders = await _orderRepository.GetListAsync();
        if (orders.Any()) return;

        var warehouses = await _warehouseRepository.GetListAsync();
        var customers = await _customerRepository.GetListAsync();
        var batches = await _stockBatchRepository.GetListAsync();

        if (warehouses.Count < 3 || customers.Count < 3 || batches.Count < 5) return;

        var now = DateTime.Today;

        // Sipariş 1 → Ana Lojistik Dağıtım Merkezi
        var order1 = new Order
        {
            PharmacyId = Guid.Empty, // Depo bazlı B2B: eczane değil depo muhatap
            CustomerId = customers[0].Id,
            WarehouseId = warehouses[0].Id,
            WarehouseName = warehouses[0].Name,
            OrderNumber = "ORD-2024-001",
            OrderDate = now.AddDays(-10),
            Status = OrderStatus.Fulfilled,
            Notes = "Rutin depoda mal siparişi"
        };
        await _orderRepository.InsertAsync(order1, autoSave: true);

        var ship1 = new Shipment
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[0].Id,
            WarehouseName = warehouses[0].Name,
            OrderId = order1.Id,
            TrackingNumber = "SHP-2024-001",
            ShipmentDate = now.AddDays(-9),
            Status = ShipmentStatus.Delivered,
            DeliveryDate = now.AddDays(-8)
        };
        await _shipmentRepository.InsertAsync(ship1, autoSave: true);

        var inv1 = new Invoice
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[0].Id,
            WarehouseName = warehouses[0].Name,
            ShipmentId = ship1.Id,
            InvoiceNumber = "INV-2024-001",
            IssueDate = now.AddDays(-8),
            DueDate = now.AddDays(22),
            SubTotal = 275.00m,
            TaxTotal = 27.50m,
            GrandTotal = 302.50m,
            Status = InvoiceStatus.Issued
        };
        await _invoiceRepository.InsertAsync(inv1, autoSave: true);

        // Sipariş 2 → Marmara Merkez Depo
        var order2 = new Order
        {
            PharmacyId = Guid.Empty,
            CustomerId = customers[1].Id,
            WarehouseId = warehouses[1].Id,
            WarehouseName = warehouses[1].Name,
            OrderNumber = "ORD-2024-002",
            OrderDate = now.AddDays(-7),
            Status = OrderStatus.Fulfilled,
            Notes = "Acil depoda mal siparişi"
        };
        await _orderRepository.InsertAsync(order2, autoSave: true);

        var ship2 = new Shipment
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[1].Id,
            WarehouseName = warehouses[1].Name,
            OrderId = order2.Id,
            TrackingNumber = "SHP-2024-002",
            ShipmentDate = now.AddDays(-6),
            Status = ShipmentStatus.Delivered,
            DeliveryDate = now.AddDays(-5)
        };
        await _shipmentRepository.InsertAsync(ship2, autoSave: true);

        var inv2 = new Invoice
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[1].Id,
            WarehouseName = warehouses[1].Name,
            ShipmentId = ship2.Id,
            InvoiceNumber = "INV-2024-002",
            IssueDate = now.AddDays(-5),
            DueDate = now.AddDays(25),
            SubTotal = 120.00m,
            TaxTotal = 12.00m,
            GrandTotal = 132.00m,
            Status = InvoiceStatus.Issued
        };
        await _invoiceRepository.InsertAsync(inv2, autoSave: true);

        // Sipariş 3 → İstanbul Merkez Depo
        var order3 = new Order
        {
            PharmacyId = Guid.Empty,
            CustomerId = customers[2].Id,
            WarehouseId = warehouses[2].Id,
            WarehouseName = warehouses[2].Name,
            OrderNumber = "ORD-2024-003",
            OrderDate = now.AddDays(-4),
            Status = OrderStatus.Fulfilled,
            Notes = "Aylık stok yenileme (depo bazlı)"
        };
        await _orderRepository.InsertAsync(order3, autoSave: true);

        var ship3 = new Shipment
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[2].Id,
            WarehouseName = warehouses[2].Name,
            OrderId = order3.Id,
            TrackingNumber = "SHP-2024-003",
            ShipmentDate = now.AddDays(-3),
            Status = ShipmentStatus.Delivered,
            DeliveryDate = now.AddDays(-2)
        };
        await _shipmentRepository.InsertAsync(ship3, autoSave: true);

        var inv3 = new Invoice
        {
            PharmacyId = Guid.Empty,
            WarehouseId = warehouses[2].Id,
            WarehouseName = warehouses[2].Name,
            ShipmentId = ship3.Id,
            InvoiceNumber = "INV-2024-003",
            IssueDate = now.AddDays(-2),
            DueDate = now.AddDays(28),
            SubTotal = 425.00m,
            TaxTotal = 42.50m,
            GrandTotal = 467.50m,
            Status = InvoiceStatus.Issued
        };
        await _invoiceRepository.InsertAsync(inv3, autoSave: true);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 9. SATIŞLAR
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedSalesAsync()
    {
        var sales = await _saleRepository.GetListAsync();
        if (sales.Any()) return;

        var pharmacies = await _pharmacyRepository.GetListAsync();
        var customers = await _customerRepository.GetListAsync();
        var invoices = await _invoiceRepository.GetListAsync();
        var orders = await _orderRepository.GetListAsync();
        var shipments = await _shipmentRepository.GetListAsync();
        var prescriptions = await _prescriptionRepository.GetListAsync();

        if (pharmacies.Count < 2 || customers.Count < 2 || invoices.Count < 2) return;

        var now = DateTime.Today;

        // Satış 1: Şifa Eczanesi → Panadol satışı (fatura bağlı)
        var sale1 = new Sale
        {
            PharmacyId = pharmacies[0].Id,
            CustomerId = customers[0].Id,
            PrescriptionId = null,
            SaleDate = now.AddDays(-2),
            TotalAmount = 91.00m,
            Status = SaleStatus.Active,
            InvoiceId = invoices[0].Id,
            OrderId = orders[0].Id,
            ShipmentId = shipments[0].Id
        };
        await _saleRepository.InsertAsync(sale1, autoSave: true);

        // Satış 2: Hayat Eczanesi → Advil satışı (reçeteli)
        var sale2 = new Sale
        {
            PharmacyId = pharmacies[1].Id,
            CustomerId = customers[1].Id,
            PrescriptionId = prescriptions.Any() ? prescriptions[0].Id : null,
            SaleDate = now.AddDays(-1),
            TotalAmount = 77.50m,
            Status = SaleStatus.Active,
            InvoiceId = invoices[1].Id,
            OrderId = orders[1].Id,
            ShipmentId = shipments[1].Id
        };
        await _saleRepository.InsertAsync(sale2, autoSave: true);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 10. FİYAT GEÇMİŞİ (ek güncellemeler)
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedPricesAsync()
    {
        var existing = await _priceHistoryRepository.GetListAsync();
        if (existing.Count >= 15) return; // zaten doluysa atla

        var drugs = await _drugRepository.GetListAsync();
        if (drugs.Count < 3) return;

        var now = DateTime.Today;

        // İlk fiyat zaten eklenmiş olabilir, ikinci fiyat güncellemesi ekle
        foreach (var drug in drugs.Take(5))
        {
            // Check if price history already exists for this drug and date range
            var existingPrice = await _priceHistoryRepository.FirstOrDefaultAsync(p =>
                p.DrugId == drug.Id && p.ValidFrom == now.AddDays(-30) && p.ValidTo == now);

            if (existingPrice == null)
            {
                await _priceHistoryRepository.InsertAsync(new DrugPriceHistory
                {
                    DrugId = drug.Id,
                    Price = 50.00m, // örnek güncellenmiş fiyat
                    TaxRate = 1m,
                    ValidFrom = now.AddDays(-30),
                    ValidTo = now,
                    IsCoveredByStateInsurance = false,
                    StateCoveragePercentage = 0m
                }, autoSave: true);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 11. STOK HAREKET LOG'LARI
    // ─────────────────────────────────────────────────────────────────────

    private async Task SeedMovementsAsync()
    {
        var existing = await _movementLogRepository.GetListAsync();
        if (existing.Any()) return;

        var batches = await _stockBatchRepository.GetListAsync();
        var orders = await _orderRepository.GetListAsync();
        var invoices = await _invoiceRepository.GetListAsync();

        if (!batches.Any() || !invoices.Any()) return;

        // Örnek: sevkiyat ile eczaneye stok girişi (Entry)
        await _movementLogRepository.InsertAsync(new StockMovementLog
        {
            StockBatchId = batches[0].Id,
            MovementType = StockMovementType.Entry,
            ReferenceType = StockMovementReferenceType.Shipment,
            ReferenceId = orders.FirstOrDefault()?.Id,
            QuantityChange = 50,
            Description = "Sevkiyat ile merkez depodan eczaneye giriş"
        }, autoSave: true);

        // Örnek: fatura ile satış kalemi çıkışı (Dispatch)
        await _movementLogRepository.InsertAsync(new StockMovementLog
        {
            StockBatchId = batches[0].Id,
            MovementType = StockMovementType.Dispatch,
            ReferenceType = StockMovementReferenceType.Invoice,
            ReferenceId = invoices[0].Id,
            QuantityChange = 20,
            Description = "Fatura ile eczane stoğundan satış kalemi düşümü"
        }, autoSave: true);
    }
}