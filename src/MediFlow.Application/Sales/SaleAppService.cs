using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Pharmacies;
using MediFlow.Inventories;
using MediFlow.Customers;

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
    private readonly IRepository<Customer, Guid> _customerRepository;
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;

    public SaleAppService(
        IRepository<Sale, Guid> repository,
        IRepository<SaleItem, Guid> saleItemRepository,
        IRepository<PharmacyStock, Guid> pharmacyStockRepository,
        IRepository<StockBatch, Guid> stockBatchRepository,
        IRepository<Customer, Guid> customerRepository,
        IRepository<Pharmacy, Guid> pharmacyRepository) : base(repository)
    {
        _saleItemRepository = saleItemRepository;
        _pharmacyStockRepository = pharmacyStockRepository;
        _stockBatchRepository = stockBatchRepository;
        _customerRepository = customerRepository;
        _pharmacyRepository = pharmacyRepository;
    }

    // [B4] Satış oluşturulduğunda kalemler de oluşturulur ve PharmacyStock'tan düşüm yapılır.
    public override async Task<SaleDto> CreateAsync(CreateUpdateSaleDto input)
    {
        var sale = new Sale
        {
            PharmacyId = input.PharmacyId,
            CustomerId = input.CustomerId,
            PrescriptionId = input.PrescriptionId,
            SaleDate = input.SaleDate,
            TotalAmount = input.TotalAmount,
            InvoiceId = input.InvoiceId,
        };

        sale = await Repository.InsertAsync(sale);

        if (input.Items != null && input.Items.Any())
        {
            foreach (var itemInput in input.Items)
            {
                var item = new SaleItem
                {
                    SaleId = sale.Id,
                    StockBatchId = itemInput.StockBatchId,
                    Quantity = itemInput.Quantity,
                    UnitPrice = itemInput.UnitPrice,
                };
                item = await _saleItemRepository.InsertAsync(item);

                // PharmacyStock'tan düşüm yap (stok başından eksilt)
                await DeductPharmacyStockAsync(sale.PharmacyId, itemInput.StockBatchId, itemInput.Quantity);
            }
        }

        return await populateNames(ObjectMapper.Map<Sale, SaleDto>(sale));
    }

    // [D5] 填充 PharmacyName / CustomerName，避免前端 N+1 查询
    private async Task<SaleDto> populateNames(SaleDto dto)
    {
        if (dto != null)
        {
            var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Id == dto.PharmacyId);
            dto.PharmacyName = pharmacy?.Name;
            var customer = await _customerRepository.FirstOrDefaultAsync(c => c.Id == dto.CustomerId);
            dto.CustomerName = customer?.FirstName + " " + customer?.LastName;
        }
        return dto;
    }

    private async Task DeductPharmacyStockAsync(Guid pharmacyId, Guid stockBatchId, int quantity)
    {
        var batch = await _stockBatchRepository.GetAsync(stockBatchId);
        var drugId = batch.DrugId;

        var pharmacyStock = await _pharmacyStockRepository
            .GetListAsync(ps => ps.PharmacyId == pharmacyId && ps.DrugId == drugId)
            .ContinueWith(t => t.Result.FirstOrDefault());

        if (pharmacyStock == null)
        {
            // Henüz eczane stoğunda bu ilaç yoksa, yeni bir kaydı oluştur ve düş
            pharmacyStock = new PharmacyStock
            {
                PharmacyId = pharmacyId,
                DrugId = drugId,
                LotNumber = batch.LotNumber,
                ExpirationDate = batch.ExpirationDate,
                Quantity = -quantity, // Düşüş olarak başlangıç (negatif)
            };
            await _pharmacyStockRepository.InsertAsync(pharmacyStock);
        }
        else
        {
            if (pharmacyStock.Quantity - quantity < 0)
            {
                throw new UserFriendlyException($"Eczane stoğu yetersiz! Mevcut: {pharmacyStock.Quantity}, istenen: {quantity}");
            }

            pharmacyStock.Quantity -= quantity;
            await _pharmacyStockRepository.UpdateAsync(pharmacyStock);
        }
    }
}