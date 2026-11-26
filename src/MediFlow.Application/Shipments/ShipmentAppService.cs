using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using MediFlow.Inventories;
using MediFlow.Pharmacies;
using MediFlow.Orders;
using MediFlow.Warehouses;

namespace MediFlow.Shipments
{
    public class ShipmentAppService : CrudAppService<
        Shipment,
        ShipmentDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateShipmentDto,
        CreateUpdateShipmentDto>, IShipmentAppService
    {
        private readonly IRepository<OrderItem, Guid> _orderItemRepository;
        private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
        private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
        private readonly IRepository<PharmacyStock, Guid> _pharmacyStockRepository;
        private readonly IRepository<ShipmentItem, Guid> _shipmentItemRepository;
        private readonly IRepository<Warehouse, Guid> _warehouseRepository;

        public ShipmentAppService(
            IRepository<Shipment, Guid> repository,
            IRepository<OrderItem, Guid> orderItemRepository,
            IRepository<StockBatch, Guid> stockBatchRepository,
            IRepository<StockMovementLog, Guid> stockMovementLogRepository,
            IRepository<PharmacyStock, Guid> pharmacyStockRepository,
            IRepository<ShipmentItem, Guid> shipmentItemRepository,
            IRepository<Warehouse, Guid> warehouseRepository) : base(repository)
        {
            _orderItemRepository = orderItemRepository;
            _stockBatchRepository = stockBatchRepository;
            _stockMovementLogRepository = stockMovementLogRepository;
            _pharmacyStockRepository = pharmacyStockRepository;
            _shipmentItemRepository = shipmentItemRepository;
            _warehouseRepository = warehouseRepository;
        }

        // İŞ KURALI: Teslim edilmiş sevkiyatın silinmesini engelle
        public override async Task DeleteAsync(Guid id)
        {
            var shipment = await Repository.GetAsync(id);
            var deliveredStatus = (ShipmentStatus)2; // Eczane Teslim Aldı

            if (shipment.Status == deliveredStatus)
            {
                throw new UserFriendlyException("Eczaneye teslim edilmiş ve tamamlanmış sevkiyatlar silinemez!");
            }

            await base.DeleteAsync(id);
        }

        // ÖNEMLİ: Sevkiyat doğrudan "Teslim Alındı" olarak oluşturulursa da otomatik
        // stok transferi yapılır (depo -> eczane). Idempotency guard'ı çift işlemi önler.
        [UnitOfWork]
        public override async Task<ShipmentDto> CreateAsync(CreateUpdateShipmentDto input)
        {
            var result = await base.CreateAsync(input);

            var deliveredStatus = (ShipmentStatus)2;
            if (input.Status == deliveredStatus)
            {
                var shipment = await Repository.GetAsync(result.Id);
                await TransferStockToPharmacyAsync(shipment);
            }

            // Depo adını doldur (N+1 önleme)
            return await populateWarehouseName(result);
        }

        [UnitOfWork]
        public override async Task<ShipmentDto> UpdateAsync(Guid id, CreateUpdateShipmentDto input)
        {
            var existingShipment = await Repository.GetAsync(id);
            var oldStatus = existingShipment.Status;

            var result = await base.UpdateAsync(id, input);

            var deliveredStatus = (ShipmentStatus)2; // Eczane Teslim Aldı

            // EĞER SEVKİYAT "TESLİM ALINDI" Olarak ONAYLANDIYSA:
            if (input.Status == deliveredStatus && oldStatus != deliveredStatus)
            {
                var shipment = await Repository.GetAsync(id);
                await TransferStockToPharmacyAsync(shipment);
            }

            return await populateWarehouseName(result);
        }

        // Depo adını DTO'ya doldurur (N+1 önleme)
        private async Task<ShipmentDto> populateWarehouseName(ShipmentDto dto)
        {
            if (dto != null && dto.WarehouseId.HasValue)
            {
                var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Id == dto.WarehouseId.Value);
                dto.WarehouseName = warehouse?.Name;
            }
            return dto;
        }

        /// <summary>
        /// Sevkiyat onaylandığında (Eczane Teslim Aldı) depo stokundan düşer, hedef eczanenin
        /// raf stokuna (PharmacyStock) eklenir. Idempotency guard'ı sayesinde aynı sevkiyat
        /// birden fazla kez onaylansa bile stok yalnızca 1 kez transfer edilir.
        /// </summary>
        private async Task TransferStockToPharmacyAsync(Shipment shipment)
        {
            // IDEMPOTENCY GUARD: bu sevkiyatın kalemi zaten yazılmışsa transfer tamamlanmış demektir.
            var alreadyTransferred = await _shipmentItemRepository.AnyAsync(x => x.ShipmentId == shipment.Id);
            if (alreadyTransferred)
            {
                return; // Çift onay durumunda stok ikinci kez düşmemesin diye
            }

            if (!shipment.OrderId.HasValue)
            {
                return; // Sipariş bağlantısı olmayan sevkiyat stoğu otomatik transfer etmez
            }

            // Siparişteki ilaçları çekiyoruz
            var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == shipment.OrderId.Value);

            foreach (var item in orderItems)
            {
                var quantityToDeduct = item.ApprovedQuantity > 0 ? item.ApprovedQuantity : item.RequestedQuantity;
                if (quantityToDeduct <= 0) continue;

                int remainingQuantity = quantityToDeduct;

                // --- FIFO HATASI DÜZELTMESİ ---
                // Eğer OrderItem'da StockBatchId varsa (rezervasyon sırasında atandıysa) ÖNCE ONU KULLAN
                if (item.StockBatchId.HasValue)
                {
                    var reservedBatch = await _stockBatchRepository.GetAsync(item.StockBatchId.Value);
                    remainingQuantity = await ProcessBatchDeductionAsync(reservedBatch, remainingQuantity, shipment, item.DrugId);
                }

                // Hala kalan miktar varsa (veya rezervasyon yoksa) FIFO ile tamamla
                if (remainingQuantity > 0)
                {
                    var availableBatchesQuery = await _stockBatchRepository.GetQueryableAsync();
                    var availableBatches = availableBatchesQuery
                        .Where(x => x.DrugId == item.DrugId && x.Quantity > 0)
                        .OrderBy(x => x.ExpirationDate)
                        .ToList();

                    foreach (var batch in availableBatches)
                    {
                        if (remainingQuantity <= 0) break;
                        // Zaten işlenmiş batch'i atla (StockBatchId ile gelen)
                        if (item.StockBatchId.HasValue && batch.Id == item.StockBatchId.Value) continue;

                        remainingQuantity = await ProcessBatchDeductionAsync(batch, remainingQuantity, shipment, item.DrugId);
                    }
                }

                if (remainingQuantity > 0)
                {
                    throw new UserFriendlyException($"Stok miktarı yetersiz! {remainingQuantity} kutu eksik kalacak, sevkiyat teslim alamaz. (İlaç: {item.DrugId})");
                }
            }
        }

        private async Task<int> ProcessBatchDeductionAsync(StockBatch batch, int remainingQuantity, Shipment existingShipment, Guid drugId)
        {
            var deductedAmount = Math.Min(batch.Quantity, remainingQuantity);

            // 1. Fiili Depo Miktarından ve Rezervasyondan Düş
            if (batch.Quantity >= deductedAmount)
            {
                batch.Quantity -= deductedAmount;
            }
            else
            {
                throw new UserFriendlyException("Stok miktarı yetersiz. İşlem iptal edildi.");
            }

            batch.ReservedQuantity -= deductedAmount;
            if (batch.ReservedQuantity < 0) batch.ReservedQuantity = 0;

            await _stockBatchRepository.UpdateAsync(batch);

            // 2. ShipmentItem kaydı oluştur
            await _shipmentItemRepository.InsertAsync(new ShipmentItem
            {
                ShipmentId = existingShipment.Id,
                StockBatchId = batch.Id,
                Quantity = deductedAmount
            });

            // 3. Depo Hareket Logu At (Çıkış)
            await _stockMovementLogRepository.InsertAsync(new StockMovementLog
            {
                StockBatchId = batch.Id,
                MovementType = StockMovementType.Dispatch,
                QuantityChange = -deductedAmount,
                ReferenceId = existingShipment.Id,
                Description = $"Takip No: {existingShipment.TrackingNumber} ile eczaneye teslim edildi."
            });

            // 4. Eczane Raf Stokuna (PharmacyStock) Ekle / Güncelle - CONCURRENCY HANDLING
            await UpdatePharmacyStockWithRetryAsync(existingShipment.PharmacyId, batch, deductedAmount);

            return remainingQuantity - deductedAmount;
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
                    return; // Başarılı, döngüden çık
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (attempt == maxRetries - 1)
                        throw; // Son deneme de başarısız olursa exception fırlat

                    // Kısa bekle ve yeniden dene (exponential backoff)
                    await Task.Delay(50 * (attempt + 1));
                }
            }
        }
    }
}