using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp; 
using MediFlow.Shipments; 
using MediFlow.Pricing;   
using MediFlow.Orders; 

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

    public InvoiceAppService(
        IRepository<Invoice, Guid> repository,
        IRepository<Shipment, Guid> shipmentRepository,
        IRepository<OrderItem, Guid> orderItemRepository,
        IRepository<DrugPriceHistory, Guid> drugPriceHistoryRepository) : base(repository)
    {
        _shipmentRepository = shipmentRepository;
        _orderItemRepository = orderItemRepository;
        _drugPriceHistoryRepository = drugPriceHistoryRepository;
    }

    // Fatura detay veya listeleme çağrıldığında ilişkili kalemlerin (Items) veritabanından gelmesini sağlar
    protected override async Task<IQueryable<Invoice>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
    {
        // Include yerine ABP'nin WithDetails altyapısını kullanıyoruz (EntityFrameworkCore paketi istemez)
        return await Repository.WithDetailsAsync(x => x.Items);
    }

    public override async Task<InvoiceDto> GetAsync(Guid id)
    {
        var queryable = await Repository.WithDetailsAsync(x => x.Items);
        var entity = await AsyncExecuter.FirstOrDefaultAsync(queryable, x => x.Id == id);
        
        return ObjectMapper.Map<Invoice, InvoiceDto>(entity);
    }

    public override async Task<InvoiceDto> CreateAsync(CreateUpdateInvoiceDto input)
    {
        // 1. Ana Fatura Taslağını Oluştur
        var invoice = new Invoice
        {
            PharmacyId = input.PharmacyId,
            ShipmentId = input.ShipmentId,
            InvoiceNumber = input.InvoiceNumber,
            IssueDate = input.IssuedDate,
            DueDate = input.DueDate,
            Status = input.Status
        };

        // 2. Seçilen Sevkiyatı ve Siparişi Bul
        var shipment = await _shipmentRepository.GetAsync(input.ShipmentId);
        
        decimal subTotal = 0;
        decimal taxTotal = 0;

        if (shipment.OrderId.HasValue)
        {
            var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == shipment.OrderId.Value);

            foreach (var item in orderItems)
            {
                int quantity = item.ApprovedQuantity > 0 ? item.ApprovedQuantity : item.RequestedQuantity;
                if (quantity <= 0) continue;

                Guid targetDrugId = item.DrugId;

                // 3. Faturanın kesildiği tarihte geçerli olan fiyatı bulur
                var currentPriceRecord = await _drugPriceHistoryRepository.FirstOrDefaultAsync(
                    p => p.DrugId == targetDrugId && 
                         p.ValidFrom <= invoice.IssueDate && 
                         (p.ValidTo == null || p.ValidTo >= invoice.IssueDate)
                );
                
                decimal unitPrice = currentPriceRecord != null ? currentPriceRecord.Price : 0; 
                decimal taxRate = currentPriceRecord != null ? currentPriceRecord.TaxRate : 8.0m; 

                decimal lineSubTotal = quantity * unitPrice;
                decimal lineTax = lineSubTotal * (taxRate / 100);
                
                subTotal += lineSubTotal;
                taxTotal += lineTax;

                // 4. Fatura Alt Kalemi Ekle
                invoice.Items.Add(new InvoiceItem
                {
                    DrugId = targetDrugId,
                    StockBatchId = null, 
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    TaxRate = taxRate,
                    LineTotal = lineSubTotal + lineTax
                });
            }
        }

        // 5. Toplamları Faturaya Yaz ve Kaydet
        invoice.SubTotal = subTotal;
        invoice.TaxTotal = taxTotal;
        invoice.GrandTotal = subTotal + taxTotal;

        await Repository.InsertAsync(invoice, autoSave: true);

        return ObjectMapper.Map<Invoice, InvoiceDto>(invoice);
    }

    // GÜNCELLEME KORUMASI: Statü değişirken tutarların sıfırlanmasını engeller
    public override async Task<InvoiceDto> UpdateAsync(Guid id, CreateUpdateInvoiceDto input)
    {
        var existingInvoice = await Repository.GetAsync(id);

        existingInvoice.Status = input.Status;
        existingInvoice.InvoiceNumber = input.InvoiceNumber;
        existingInvoice.IssueDate = input.IssuedDate;
        existingInvoice.DueDate = input.DueDate;

        await Repository.UpdateAsync(existingInvoice, autoSave: true);

        return ObjectMapper.Map<Invoice, InvoiceDto>(existingInvoice);
    }

    // SİLME KORUMASI: Ödenmiş faturaların silinmesini engeller
    public override async Task DeleteAsync(Guid id)
    {
        var invoice = await Repository.GetAsync(id);

        if (invoice.Status == InvoiceStatus.Paid) 
        {
            throw new UserFriendlyException("Tahsilatı yapılmış ve ödenmiş faturalar silinemez!");
        }

        await base.DeleteAsync(id);
    }
}