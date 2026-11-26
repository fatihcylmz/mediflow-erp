using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using MediFlow.Shipments;
using MediFlow.Orders;
using MediFlow.Pricing;
using MediFlow.Inventories;
using MediFlow.Services;
using MediFlow.Warehouses;

namespace MediFlow.Invoices;

public class InvoiceAppService : CrudAppService<
    Invoice,
    InvoiceDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateInvoiceDto>, IInvoiceAppService
{
    private readonly IRepository<Shipment, Guid> _shipmentRepository;
    private readonly IRepository<OrderItem, Guid> _orderItemRepository;
    private readonly IRepository<DrugPriceHistory, Guid> _drugPriceHistoryRepository;
    private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
    private readonly IRepository<Warehouse, Guid> _warehouseRepository;
    private readonly PriceValidationService _priceValidationService;

    public InvoiceAppService(
        IRepository<Invoice, Guid> repository,
        IRepository<Shipment, Guid> shipmentRepository,
        IRepository<OrderItem, Guid> orderItemRepository,
        IRepository<DrugPriceHistory, Guid> drugPriceHistoryRepository,
        IRepository<StockMovementLog, Guid> stockMovementLogRepository,
        IRepository<Warehouse, Guid> warehouseRepository,
        PriceValidationService priceValidationService) : base(repository)
    {
        _shipmentRepository = shipmentRepository;
        _orderItemRepository = orderItemRepository;
        _drugPriceHistoryRepository = drugPriceHistoryRepository;
        _stockMovementLogRepository = stockMovementLogRepository;
        _warehouseRepository = warehouseRepository;
        _priceValidationService = priceValidationService;
    }

    protected override async Task<IQueryable<Invoice>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
    {
        return await Repository.WithDetailsAsync(x => x.Items);
    }

    public override async Task<InvoiceDto> GetAsync(Guid id)
    {
        var queryable = await Repository.WithDetailsAsync(x => x.Items);
        var entity = await AsyncExecuter.FirstOrDefaultAsync(queryable, x => x.Id == id);
        var dto = ObjectMapper.Map<Invoice, InvoiceDto>(entity);
        return await populateWarehouseName(dto);
    }

    [UnitOfWork]
    public override async Task<InvoiceDto> CreateAsync(CreateUpdateInvoiceDto input)
    {
        var invoice = new Invoice
        {
            PharmacyId = input.PharmacyId,
            WarehouseId = input.WarehouseId,
            ShipmentId = input.ShipmentId,
            InvoiceNumber = input.InvoiceNumber,
            IssueDate = input.IssuedDate,
            DueDate = input.DueDate,
            Status = input.Status
        };

        if (input.ShipmentId != Guid.Empty)
        {
            var shipment = await _shipmentRepository.GetAsync(input.ShipmentId);

            decimal subTotal = 0m;
            decimal taxTotal = 0m;

            if (shipment.OrderId.HasValue)
            {
                var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == shipment.OrderId.Value);

                foreach (var item in orderItems)
                {
                    int quantity = item.ApprovedQuantity > 0 ? item.ApprovedQuantity : item.RequestedQuantity;
                    if (quantity <= 0) continue;

                    Guid targetDrugId = item.DrugId;
                    var currentPriceRecord = await _drugPriceHistoryRepository.FirstOrDefaultAsync(
                        p => p.DrugId == targetDrugId &&
                             p.ValidFrom <= invoice.IssueDate &&
                             (p.ValidTo == null || p.ValidTo >= invoice.IssueDate));

                    decimal unitPrice = currentPriceRecord?.Price ?? 0m;
                    decimal taxRate = currentPriceRecord?.TaxRate ?? 8m;

                    // --- Fiyat doğrulama ---
                    var validationResult = await _priceValidationService.ValidatePriceAsync(
                        targetDrugId, invoice.IssueDate, unitPrice, taxRate);
                    if (!validationResult.IsValid)
                    {
                        throw new UserFriendlyException(
                            $"Fatura fiyat doğrulama hatası (İlaç ID: {targetDrugId}): {validationResult.Message}");
                    }

                    decimal lineSubTotal = quantity * unitPrice;
                    decimal lineTax = lineSubTotal * (taxRate / 100m);
                    subTotal += lineSubTotal;
                    taxTotal += lineTax;

                    invoice.Items.Add(new InvoiceItem
                    {
                        DrugId = targetDrugId,
                        StockBatchId = item.StockBatchId ?? Guid.Empty,
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        TaxRate = taxRate,
                        LineTotal = lineSubTotal + lineTax
                    });
                }
            }

            invoice.SubTotal = subTotal;
            invoice.TaxTotal = taxTotal;
            invoice.GrandTotal = subTotal + taxTotal;
        }

        await Repository.InsertAsync(invoice, autoSave: true);
        var dto = ObjectMapper.Map<Invoice, InvoiceDto>(invoice);
        return await populateWarehouseName(dto);
    }

    public override async Task<InvoiceDto> UpdateAsync(Guid id, CreateUpdateInvoiceDto input)
    {
        var existingInvoice = await Repository.GetAsync(id);

        if (existingInvoice.Status != InvoiceStatus.Draft && existingInvoice.Status != InvoiceStatus.Cancelled)
            throw new UserFriendlyException("Tamamlanmış veya ödenmiş faturalar düzenlenemez.");

        existingInvoice.Status = input.Status;
        existingInvoice.InvoiceNumber = input.InvoiceNumber;
        existingInvoice.IssueDate = input.IssuedDate;
        existingInvoice.DueDate = input.DueDate;

        existingInvoice.Items.Clear();
        foreach (var item in input.Items)
        {
            existingInvoice.Items.Add(new InvoiceItem
            {
                DrugId = item.DrugId,
                StockBatchId = item.StockBatchId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TaxRate = item.TaxRate,
                LineTotal = item.LineTotal
            });
        }

        existingInvoice.SubTotal = existingInvoice.Items.Sum(i => i.Quantity * i.UnitPrice);
        existingInvoice.TaxTotal = existingInvoice.Items.Sum(i => i.Quantity * i.UnitPrice * (i.TaxRate / 100m));
        existingInvoice.GrandTotal = existingInvoice.SubTotal + existingInvoice.TaxTotal;

        await Repository.UpdateAsync(existingInvoice, autoSave: true);
        var dto = ObjectMapper.Map<Invoice, InvoiceDto>(existingInvoice);
        return await populateWarehouseName(dto);
    }

    public override async Task DeleteAsync(Guid id)
    {
        var invoice = await Repository.GetAsync(id);
        if (invoice.Status != InvoiceStatus.Draft && invoice.Status != InvoiceStatus.Cancelled)
            throw new UserFriendlyException($"Silme engellendi! Fatura durumu '{invoice.Status}' — yalnızca taslak veya iptal edilmiş faturalar silinebilir.");
        await base.DeleteAsync(id);
    }

    /// <summary>
    /// Faturayı iptal eder. Ödenmiş faturalar iptal edilemez, kredi notu süreci izlenmelidir.
    /// </summary>
    [UnitOfWork]
    public async Task CancelInvoiceAsync(Guid invoiceId)
    {
        var invoice = await Repository.GetAsync(invoiceId);

        if (invoice.Status == InvoiceStatus.Cancelled)
            return;

        if (invoice.Status == InvoiceStatus.Paid)
            throw new UserFriendlyException("Ödenmiş faturalar iptal edilemez. Lütfen kredi notası kesilmesini uygulayın.");

        // İptal edilen kalemler için stok hareket logu oluştur
        foreach (var item in invoice.Items.ToList())
        {
            if (item.StockBatchId.HasValue && item.StockBatchId.Value != Guid.Empty)
            {
                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = item.StockBatchId.Value,
                    MovementType = StockMovementType.Scrap,
                    QuantityChange = -item.Quantity,
                    ReferenceId = invoice.Id,
                    Description = $"Fatura iptali ({invoice.InvoiceNumber}): {item.Quantity} adet geri alındı."
                });
            }
        }

        invoice.Status = InvoiceStatus.Cancelled;
        await Repository.UpdateAsync(invoice);
    }

    // Depo adını DTO'ya doldurur (N+1 önleme)
    private async Task<InvoiceDto> populateWarehouseName(InvoiceDto dto)
    {
        if (dto != null && dto.WarehouseId.HasValue)
        {
            var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Id == dto.WarehouseId.Value);
            dto.WarehouseName = warehouse?.Name;
        }
        return dto;
    }
}
