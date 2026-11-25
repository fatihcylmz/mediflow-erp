using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using MediFlow.Inventories;
using MediFlow.Orders;
using MediFlow.Pharmacies;
using MediFlow.Services;
using MediFlow.Invoices;

namespace MediFlow.Returns;

[Authorize]
public class ReturnAppService : CrudAppService<
    Return,
    ReturnDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateReturnDto>, IReturnAppService
{
    private readonly IRepository<ReturnItem, Guid> _returnItemRepository;
    private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
    private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
    private readonly IRepository<OrderItem, Guid> _orderItemRepository;
    private readonly IRepository<PharmacyStock, Guid> _pharmacyStockRepository;
    private readonly IRepository<InvoiceItem, Guid> _invoiceItemRepository;
    private readonly PriceValidationService _priceValidationService;

    public ReturnAppService(
        IRepository<Return, Guid> repository,
        IRepository<ReturnItem, Guid> returnItemRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<StockMovementLog, Guid> stockMovementLogRepository,
        IRepository<OrderItem, Guid> orderItemRepository,
        IRepository<PharmacyStock, Guid> pharmacyStockRepository,
        IRepository<InvoiceItem, Guid> invoiceItemRepository,
        PriceValidationService priceValidationService) : base(repository)
    {
        _returnItemRepository = returnItemRepository;
        _stockBatchRepository = stockBatchRepository;
        _stockMovementLogRepository = stockMovementLogRepository;
        _orderItemRepository = orderItemRepository;
        _pharmacyStockRepository = pharmacyStockRepository;
        _invoiceItemRepository = invoiceItemRepository;
        _priceValidationService = priceValidationService;
    }

    /// <summary>
    /// İade işlemini işler: iade edilen stokları depoya ve eczane rafına geri ekler ve hareket logu oluşturur.
    /// Çağırma: İade durumu "Approved" olduğunda çağrılmalıdır.
    /// </summary>
    [UnitOfWork]
    public async Task ProcessReturnAsync(Guid returnId)
    {
        var @return = await Repository.GetAsync(returnId);

        // Already processed - skip
        if (@return.Status == ReturnStatus.Approved || @return.Status == ReturnStatus.Rejected || @return.Status == ReturnStatus.Quarantine)
            return;

        var items = await _returnItemRepository.GetListAsync(i => i.ReturnId == returnId);

        foreach (var item in items)
        {
            // StockBatchId'yi çöz: ReturnItem'da boşsa InvoiceItem'dan bul
            Guid? stockBatchId = item.StockBatchId;
            if (stockBatchId == Guid.Empty && @return.InvoiceId != Guid.Empty)
            {
                var invoiceItem = await _invoiceItemRepository.FirstOrDefaultAsync(ii =>
                    ii.InvoiceId == @return.InvoiceId && ii.DrugId == item.DrugId);

                if (invoiceItem != null && invoiceItem.StockBatchId != null && invoiceItem.StockBatchId != Guid.Empty)
                {
                    stockBatchId = invoiceItem.StockBatchId;
                    // ReturnItem'ı güncelle ki ileride tekrar bulmaya gerek kalmasın
                    item.StockBatchId = stockBatchId.Value;
                    await _returnItemRepository.UpdateAsync(item);
                }
            }

            if (stockBatchId != null && stockBatchId != Guid.Empty)
            {
                // Fiyat validasyonu
                var batch = await _stockBatchRepository.GetAsync(stockBatchId.Value);
                var validationResult = await _priceValidationService.ValidatePriceAsync(
                    batch.DrugId,
                    @return.ReturnDate,
                    item.UnitPrice,
                    item.TaxRate);

                if (!validationResult.IsValid)
                {
                    throw new UserFriendlyException($"İade fiyat doğrulama hatası: {validationResult.Message}");
                }

                // 1. Merkez Depo Stoğu Artır - Concurrency retry ile
                await UpdateStockBatchWithRetryAsync(stockBatchId.Value, item.Quantity);

                // 2. Depo Hareket Logu (Giriş)
                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = batch.Id,
                    MovementType = StockMovementType.Entry,
                    QuantityChange = item.Quantity,
                    ReferenceId = returnId,
                    Description = $"İade ile stoğa geri eklendi. İade No: {@return.TrackingNumber}, İlaç: {item.DrugId}"
                });

                // 3. [KRİTİK] Eczane Raf Stoğu Artır - Concurrency retry ile
                await UpdatePharmacyStockWithRetryAsync(@return.PharmacyId, batch, item.Quantity);

                // 4. Eczane Raf Hareket Logu (Giriş)
                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = stockBatchId.Value,
                    MovementType = StockMovementType.Entry,
                    QuantityChange = item.Quantity,
                    ReferenceId = returnId,
                    Description = $"İade ile eczane raf stokuna eklendi. İade No: {@return.TrackingNumber}"
                });
            }
        }

        // Mark as approved
        @return.Status = ReturnStatus.Approved;
        await Repository.UpdateAsync(@return);
    }

    private async Task UpdateStockBatchWithRetryAsync(Guid stockBatchId, int quantityToAdd, int maxRetries = 3)
    {
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                var batch = await _stockBatchRepository.GetAsync(stockBatchId);
                batch.Quantity += quantityToAdd;
                await _stockBatchRepository.UpdateAsync(batch);
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