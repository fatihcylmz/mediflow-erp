using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using MediFlow.Inventories;
using MediFlow.Warehouses;
using MediFlow.Shipments;
using MediFlow.Orders;

namespace MediFlow.Orders
{
    public class OrderItemAppService : CrudAppService<
        OrderItem,
        OrderItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateOrderItemDto>,
        IOrderItemAppService
    {
        private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
        private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
        private readonly IRepository<Warehouse, Guid> _warehouseRepository;
        private readonly IRepository<Order, Guid> _orderRepository;
        private readonly IRepository<Shipment, Guid> _shipmentRepository;

        public OrderItemAppService(
            IRepository<OrderItem, Guid> repository,
            IRepository<StockBatch, Guid> stockBatchRepository,
            IRepository<StockMovementLog, Guid> stockMovementLogRepository,
            IRepository<Warehouse, Guid> warehouseRepository,
            IRepository<Order, Guid> orderRepository,
            IRepository<Shipment, Guid> shipmentRepository) : base(repository)
        {
            _stockBatchRepository = stockBatchRepository;
            _stockMovementLogRepository = stockMovementLogRepository;
            _warehouseRepository = warehouseRepository;
            _orderRepository = orderRepository;
            _shipmentRepository = shipmentRepository;
        }

        // İŞ KURALI: Sipariş durumu Fulfilled veya Cancelled ise ya da sevkiyat başlamışsa kalemler değiştirilemez!
        private async Task CheckOrderEditableAsync(Guid orderId)
        {
            var order = await _orderRepository.GetAsync(orderId);

            if (order.Status == OrderStatus.Fulfilled || order.Status == OrderStatus.Cancelled)
            {
                throw new UserFriendlyException("Tamamlanmış veya iptal edilmiş siparişlerin kalemleri değiştirilemez!");
            }

            var shipment = await _shipmentRepository.FirstOrDefaultAsync(x => x.OrderId == orderId);
            if (shipment != null && (int)shipment.Status >= 1)
            {
                throw new UserFriendlyException("Sevkiyatı başlatılmış siparişlerin kalemleri değiştirilemez!");
            }
        }

        public override async Task<OrderItemDto> CreateAsync(CreateUpdateOrderItemDto input)
        {
            await CheckOrderEditableAsync(input.OrderId);

            if (input.ApprovedQuantity > input.RequestedQuantity)
            {
                throw new UserFriendlyException($"Talep edilen miktardan ({input.RequestedQuantity}) fazla onay verilemez!");
            }

            var stockBatches = await _stockBatchRepository.GetListAsync(x => x.DrugId == input.DrugId);
            var availableStock = stockBatches.Sum(x => x.Quantity - x.ReservedQuantity);

            if (input.ApprovedQuantity > availableStock)
            {
                throw new UserFriendlyException($"Depoda yeterli serbest stok yok! Mevcut Serbest Stok: {availableStock} Kutu.");
            }

            if (input.ApprovedQuantity > 0)
            {
                await SyncStockReservationAsync(input.DrugId, 0, input.ApprovedQuantity);
            }

            return await base.CreateAsync(input);
        }

        public override async Task<OrderItemDto> UpdateAsync(Guid id, CreateUpdateOrderItemDto input)
        {
            var existingItem = await Repository.GetAsync(id);
            await CheckOrderEditableAsync(existingItem.OrderId);

            int oldApprovedQty = existingItem.ApprovedQuantity;

            if (input.ApprovedQuantity > input.RequestedQuantity)
            {
                throw new UserFriendlyException($"Talep edilen miktardan ({input.RequestedQuantity}) fazla onay verilemez!");
            }

            var stockBatches = await _stockBatchRepository.GetListAsync(x => x.DrugId == input.DrugId);
            var availableStock = stockBatches.Sum(x => x.Quantity - x.ReservedQuantity);

            var maxAllowed = availableStock + oldApprovedQty;

            if (input.ApprovedQuantity > maxAllowed)
            {
                throw new UserFriendlyException($"Depoda yeterli stok yok! Maksimum onaylanabilir: {maxAllowed} Kutu.");
            }

            if (oldApprovedQty != input.ApprovedQuantity)
            {
                await SyncStockReservationAsync(input.DrugId, oldApprovedQty, input.ApprovedQuantity);
            }

            return await base.UpdateAsync(id, input);
        }

        public override async Task DeleteAsync(Guid id)
        {
            var existingItem = await Repository.GetAsync(id);
            await CheckOrderEditableAsync(existingItem.OrderId);

            if (existingItem.ApprovedQuantity > 0)
            {
                await SyncStockReservationAsync(existingItem.DrugId, existingItem.ApprovedQuantity, 0);
            }

            await base.DeleteAsync(id);
        }

        // --- FIFO MANTIĞIYLA STOK REZERVE EDEN VE LOG ATAN MERKEZİ METOT ---
        private async Task SyncStockReservationAsync(Guid drugId, int oldQty, int newQty)
        {
            int diff = newQty - oldQty;
            if (diff == 0) return;

            var batches = (await _stockBatchRepository.GetListAsync(x => x.DrugId == drugId))
                            .OrderBy(x => x.ExpirationDate)
                            .ToList();

            if (diff > 0)
            {
                int remainingToReserve = diff;
                foreach (var batch in batches.Where(x => (x.Quantity - x.ReservedQuantity) > 0))
                {
                    if (remainingToReserve <= 0) break;

                    int batchAvailable = batch.Quantity - batch.ReservedQuantity;
                    int reserveAmount = Math.Min(batchAvailable, remainingToReserve);

                    batch.ReservedQuantity += reserveAmount;
                    await _stockBatchRepository.UpdateAsync(batch);

                    var warehouse = await _warehouseRepository.FirstOrDefaultAsync(x => x.Id == batch.WarehouseId);
                    string depoAdi = warehouse != null ? warehouse.Name : "Merkez Depo";

                    string sktTarihi = batch.ExpirationDate.ToString("dd.MM.yyyy");
                    string aciklama = $"FIFO Onayı: {reserveAmount} kutu rezerve edildi. (Depo: {depoAdi}, Lot: {batch.LotNumber}, SKT: {sktTarihi})";

                    await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                    {
                        StockBatchId = batch.Id,
                        MovementType = StockMovementType.Dispatch,
                        QuantityChange = -reserveAmount,
                        Description = aciklama
                    });

                    remainingToReserve -= reserveAmount;
                }
            }
            else
            {
                int remainingToRelease = Math.Abs(diff);
                foreach (var batch in batches.Where(x => x.ReservedQuantity > 0))
                {
                    if (remainingToRelease <= 0) break;

                    int releaseAmount = Math.Min(batch.ReservedQuantity, remainingToRelease);

                    batch.ReservedQuantity -= releaseAmount;
                    await _stockBatchRepository.UpdateAsync(batch);

                    var warehouse = await _warehouseRepository.FirstOrDefaultAsync(x => x.Id == batch.WarehouseId);
                    string depoAdi = warehouse != null ? warehouse.Name : "Merkez Depo";

                    string sktTarihi = batch.ExpirationDate.ToString("dd.MM.yyyy");
                    string aciklama = $"İptal/Revize İadesi: {releaseAmount} kutu envantere iade edildi. (Depo: {depoAdi}, Lot: {batch.LotNumber}, SKT: {sktTarihi})";

                    await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                    {
                        StockBatchId = batch.Id,
                        MovementType = StockMovementType.ReturnIn,
                        QuantityChange = releaseAmount,
                        Description = aciklama
                    });

                    remainingToRelease -= releaseAmount;
                }
            }
        }
    }
}