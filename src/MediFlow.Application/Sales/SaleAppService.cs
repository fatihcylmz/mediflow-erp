using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using Volo.Abp.Identity;
using Volo.Abp.Users;
using MediFlow.Pharmacies;
using MediFlow.Inventories;
using MediFlow.Customers;
using MediFlow.Services;
using MediFlow.Shipments;
using MediFlow.Orders;
using MediFlow.Invoices;

namespace MediFlow.Sales;

[Authorize]
public class SaleAppService : CrudAppService<
    Sale,
    SaleDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateSaleDto>, ISaleAppService
{
    private readonly IRepository<SaleItem, Guid> _saleItemRepository;
    private readonly IRepository<PharmacyStock, Guid> _pharmacyStockRepository;
    private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
    private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
    private readonly IRepository<Customer, Guid> _customerRepository;
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
    private readonly PriceValidationService _priceValidationService;
    private readonly IRepository<Shipment, Guid> _shipmentRepository;
    private readonly IRepository<Order, Guid> _orderRepository;
    private readonly IRepository<Invoice, Guid> _invoiceRepository;
    private readonly UserScopeService _userScopeService;

    public SaleAppService(
        IRepository<Sale, Guid> repository,
        IRepository<SaleItem, Guid> saleItemRepository,
        IRepository<PharmacyStock, Guid> pharmacyStockRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<StockMovementLog, Guid> stockMovementLogRepository,
        IRepository<Customer, Guid> customerRepository,
        IRepository<Pharmacy, Guid> pharmacyRepository,
        PriceValidationService priceValidationService,
        IRepository<Shipment, Guid> shipmentRepository,
        IRepository<Order, Guid> orderRepository,
        IRepository<Invoice, Guid> invoiceRepository,
        UserScopeService userScopeService) : base(repository)
    {
        _saleItemRepository = saleItemRepository;
        _pharmacyStockRepository = pharmacyStockRepository;
        _stockBatchRepository = stockBatchRepository;
        _stockMovementLogRepository = stockMovementLogRepository;
        _customerRepository = customerRepository;
        _pharmacyRepository = pharmacyRepository;
        _priceValidationService = priceValidationService;
        _shipmentRepository = shipmentRepository;
        _orderRepository = orderRepository;
        _invoiceRepository = invoiceRepository;
        _userScopeService = userScopeService;
    }

    // Eczane kapsamı: PharmacyAdmin/Sales yalnızca kendi eczanesinin satışlarını görür.
    public override async Task<SaleDto> GetAsync(Guid id)
    {
        var dto = await base.GetAsync(id);

        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();
        if (pharmacyScope.HasValue && dto.PharmacyId != pharmacyScope.Value)
        {
            throw new UserFriendlyException("Bu satışa erişme yetkiniz bulunmuyor.");
        }

        return dto;
    }

    public override async Task<PagedResultDto<SaleDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();

        if (!pharmacyScope.HasValue)
        {
            return await base.GetListAsync(input);
        }

        // Eczane rolleri: yalnızca kendi eczanesinin satışlarını görür (fail-closed: Guid.Empty = sonuç yok)
        var allSales = await Repository.GetListAsync(s => s.PharmacyId == pharmacyScope.Value);

        var pagedSales = allSales
            .OrderByDescending(s => s.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = new List<SaleDto>();
        foreach (var sale in pagedSales)
        {
            var dto = ObjectMapper.Map<Sale, SaleDto>(sale);
            dtos.Add(await populateNames(dto));
        }

        return new PagedResultDto<SaleDto>(allSales.Count, dtos);
    }

    public override async Task<SaleDto> CreateAsync(CreateUpdateSaleDto input)
    {
        // Eczane rolleri yalnızca kendi eczanesine satış yapabilir
        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();
        if (pharmacyScope.HasValue)
        {
            input.PharmacyId = pharmacyScope.Value;
        }

        var sale = new Sale
        {
            PharmacyId = input.PharmacyId,
            CustomerId = input.CustomerId,
            PrescriptionId = input.PrescriptionId,
            SaleDate = input.SaleDate,
            TotalAmount = input.TotalAmount,
            InvoiceId = input.InvoiceId,
            OrderId = input.OrderId,
            ShipmentId = input.ShipmentId,
            Status = SaleStatus.Active
        };

        sale = await Repository.InsertAsync(sale);

        if (input.Items != null && input.Items.Any())
        {
            foreach (var itemInput in input.Items)
            {
                // Fiyat validasyonu
                var batch = await _stockBatchRepository.GetAsync(itemInput.StockBatchId);
                var validationResult = await _priceValidationService.ValidatePriceAsync(
                    batch.DrugId,
                    input.SaleDate,
                    itemInput.UnitPrice);

                if (!validationResult.IsValid)
                {
                    throw new UserFriendlyException($"Fiyat doğrulama hatası: {validationResult.Message}");
                }

                var item = new SaleItem
                {
                    SaleId = sale.Id,
                    StockBatchId = itemInput.StockBatchId,
                    Quantity = itemInput.Quantity,
                    UnitPrice = itemInput.UnitPrice,
                };
                item = await _saleItemRepository.InsertAsync(item);

                // PharmacyStock'tan düşüm yap (stok başından eksilt) - FIFO: en eski SKT öncelikli
                await DeductPharmacyStockWithRetryAsync(sale.PharmacyId, itemInput.StockBatchId, itemInput.Quantity, sale.Id);
            }
        }

        return await populateNames(ObjectMapper.Map<Sale, SaleDto>(sale));
    }

    /// <summary>
    /// Satışı iptal eder ve PharmacyStock miktarını geri ekler.
    /// İptal edilen satışın kalemleri için StockMovementLog.Entry kaydı oluşturulur.
    /// </summary>
    [UnitOfWork]
    public async Task CancelSaleAsync(Guid saleId)
    {
        var sale = await Repository.GetAsync(saleId);

        if (sale.Status == SaleStatus.Cancelled)
        {
            return; // Already cancelled
        }

        var saleItems = await _saleItemRepository.GetListAsync(i => i.SaleId == saleId);

        foreach (var item in saleItems)
        {
            if (item.StockBatchId != Guid.Empty)
            {
                var batch = await _stockBatchRepository.GetAsync(item.StockBatchId);

                // 1. PharmacyStock'a geri ekle (Concurrency retry ile)
                await UpdatePharmacyStockWithRetryAsync(sale.PharmacyId, batch, item.Quantity);

                // 2. Eczane Raf Hareket Logu (Giriş - iade)
                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = item.StockBatchId,
                    MovementType = StockMovementType.Entry,
                    QuantityChange = item.Quantity,
                    ReferenceId = saleId,
                    Description = $"Satış iptali ile eczane raf stokuna geri eklendi. Satış No: {sale.Id}"
                });
            }
        }

        // Mark as cancelled
        sale.Status = SaleStatus.Cancelled;
        await Repository.UpdateAsync(sale);
    }

    // [D5] Populate PharmacyName / CustomerName to avoid frontend N+1 queries
    private async Task<SaleDto> populateNames(SaleDto dto)
    {
        if (dto != null)
        {
            var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Id == dto.PharmacyId);
            dto.PharmacyName = pharmacy?.Name;
            var customer = await _customerRepository.FirstOrDefaultAsync(c => c.Id == dto.CustomerId);
            dto.CustomerName = customer?.FirstName + " " + customer?.LastName;

            // Traceability isimleri
            if (dto.ShipmentId.HasValue)
            {
                var shipment = await _shipmentRepository.FirstOrDefaultAsync(s => s.Id == dto.ShipmentId.Value);
                dto.ShipmentTrackingNumber = shipment?.TrackingNumber;
            }
            if (dto.OrderId.HasValue)
            {
                var order = await _orderRepository.FirstOrDefaultAsync(o => o.Id == dto.OrderId.Value);
                dto.OrderNumber = order?.OrderNumber;
            }
            if (dto.InvoiceId.HasValue)
            {
                var invoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.Id == dto.InvoiceId.Value);
                dto.InvoiceNumber = invoice?.InvoiceNumber;
            }
        }
        return dto;
    }

    private async Task DeductPharmacyStockWithRetryAsync(Guid pharmacyId, Guid stockBatchId, int quantity, Guid referenceId, int maxRetries = 3)
    {
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                var batch = await _stockBatchRepository.GetAsync(stockBatchId);
                var drugId = batch.DrugId;

                // FIFO: ExpirationDate'e göre sırala, en yakın SKT önce
                var pharmacyStocks = await _pharmacyStockRepository.GetListAsync(ps =>
                    ps.PharmacyId == pharmacyId &&
                    ps.DrugId == drugId &&
                    ps.LotNumber == batch.LotNumber)
                    .ContinueWith(t => t.Result.OrderBy(ps => ps.ExpirationDate).ToList());

                var pharmacyStock = pharmacyStocks.FirstOrDefault();

                if (pharmacyStock == null)
                {
                    throw new UserFriendlyException($"Eczane stoğunda bu ilaç (Lot: {batch.LotNumber}) bulunamadı. Satış iptal edildi.");
                }

                if (pharmacyStock.Quantity - quantity < 0)
                {
                    throw new UserFriendlyException($"Eczane stoğu yetersiz! Mevcut: {pharmacyStock.Quantity}, istenen: {quantity}");
                }

                pharmacyStock.Quantity -= quantity;
                await _pharmacyStockRepository.UpdateAsync(pharmacyStock);

                // StockMovementLog - Satış çıkışı
                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = stockBatchId,
                    MovementType = StockMovementType.Dispatch,
                    QuantityChange = -quantity,
                    ReferenceId = referenceId,
                    Description = $"Satış ile eczane rafından düşüldü. Lot: {batch.LotNumber}, SKT: {batch.ExpirationDate:dd.MM.yyyy}"
                });

                return; // Başarılı, döngüden çık
            }
            catch (DbUpdateConcurrencyException)
            {
                if (attempt == maxRetries - 1)
                    throw;

                await Task.Delay(50 * (attempt + 1));
            }
        }
    }

    private async Task UpdatePharmacyStockWithRetryAsync(Guid pharmacyId, StockBatch batch, int quantityToAdd, int maxRetries = 3)
    {
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                var existingPharmacyStock = await _pharmacyStockRepository.FirstOrDefaultAsync(
                    x => x.PharmacyId == pharmacyId &&
                         x.DrugId == batch.DrugId &&
                         x.LotNumber == batch.LotNumber
                );

                if (existingPharmacyStock != null)
                {
                    existingPharmacyStock.Quantity += quantityToAdd;
                    await _pharmacyStockRepository.UpdateAsync(existingPharmacyStock);
                }
                else
                {
                    await _pharmacyStockRepository.InsertAsync(new PharmacyStock
                    {
                        PharmacyId = pharmacyId,
                        DrugId = batch.DrugId,
                        LotNumber = batch.LotNumber,
                        ExpirationDate = batch.ExpirationDate,
                        Quantity = quantityToAdd
                    });
                }
                return;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (attempt == maxRetries - 1)
                    throw;

                await Task.Delay(50 * (attempt + 1));
            }
        }
    }
}
