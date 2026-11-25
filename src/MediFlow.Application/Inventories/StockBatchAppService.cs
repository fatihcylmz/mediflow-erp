using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Drugs;
using MediFlow.Warehouses;

namespace MediFlow.Inventories;

public class StockBatchAppService : CrudAppService<
    StockBatch,
    StockBatchDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateStockBatchDto>, IStockBatchAppService
{
    private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
    private readonly IRepository<Warehouse, Guid> _warehouseRepository;
    private readonly IRepository<Drug, Guid> _drugRepository;

    public StockBatchAppService(
        IRepository<StockBatch, Guid> repository,
        IRepository<StockMovementLog, Guid> stockMovementLogRepository,
        IRepository<Warehouse, Guid> warehouseRepository,
        IRepository<Drug, Guid> drugRepository) : base(repository)
    {
        _stockMovementLogRepository = stockMovementLogRepository;
        _warehouseRepository = warehouseRepository;
        _drugRepository = drugRepository;
    }

    /// <summary>
    /// Manuel stok girişi (quantityChange > 0) veya çıkışı (quantityChange < 0).
    /// Giriş: depoya yeni lot eklenirken. Çıkış: hasar/kullanım/iade işlemlerinde.
    /// </summary>
    public async Task AdjustStockAsync(Guid stockBatchId, int quantityChange, string description)
    {
        // [V2] Validasyon: Description boş geçilemez
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new UserFriendlyException("Stok işlemi için açıklama (description) alanı zorunludur!");
        }

        var batch = await Repository.GetAsync(stockBatchId);

        if (batch.IsQuarantined && quantityChange > 0)
        {
            throw new UserFriendlyException("Karantina altında olan partiye stok girişi yapılamaz!");
        }

        if (batch.Quantity + quantityChange < 0)
        {
            throw new UserFriendlyException($"Stok yetersiz! Mevcut: {batch.Quantity}, işlem: {quantityChange}");
        }

        batch.Quantity += quantityChange;
        await Repository.UpdateAsync(batch);

        // Hareket logu kaydet
        var movementType = quantityChange > 0 ? StockMovementType.Entry : StockMovementType.Scrap;
        await _stockMovementLogRepository.InsertAsync(new StockMovementLog
        {
            StockBatchId = stockBatchId,
            MovementType = movementType,
            QuantityChange = quantityChange,
            Description = description ?? "Manuel stok işlemi"
        });
    }

    public override async Task<StockBatchDto> CreateAsync(CreateUpdateStockBatchDto input)
    {
        // [#10 Soğuk zincir validasyonu] RequiresColdChain=true olan ilaçlar sadece HasColdStorage=true depoya girebilir
        var drug = await _drugRepository.GetAsync(input.DrugId);
        if (drug.RequiresColdChain && !input.IsQuarantined)
        {
            var warehouse = await _warehouseRepository.GetAsync(input.WarehouseId);
            if (!warehouse.HasColdStorage)
            {
                throw new UserFriendlyException("Soğuk zincir gerektiren ilaçlar sadece soğuk depolara atanabilir!");
            }
        }

        return await base.CreateAsync(input);
    }
}