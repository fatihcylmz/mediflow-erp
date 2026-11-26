using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using MediFlow.Inventories;
using MediFlow.Warehouses;
using MediFlow.Pharmacies;
using MediFlow.Shipments;

namespace MediFlow.Orders
{
    [Authorize]
    public class OrderAppService : CrudAppService<
        Order,
        OrderDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateOrderDto>, IOrderAppService
    {
        private readonly IRepository<OrderItem, Guid> _orderItemRepository;
        private readonly IRepository<StockBatch, Guid> _stockBatchRepository;
        private readonly IRepository<StockMovementLog, Guid> _stockMovementLogRepository;
        private readonly IRepository<Warehouse, Guid> _warehouseRepository;
        private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
        private readonly IRepository<Shipment, Guid> _shipmentRepository;

        public OrderAppService(
            IRepository<Order, Guid> repository,
            IRepository<OrderItem, Guid> orderItemRepository,
            IRepository<StockBatch, Guid> stockBatchRepository,
            IRepository<StockMovementLog, Guid> stockMovementLogRepository,
            IRepository<Warehouse, Guid> warehouseRepository,
            IRepository<Pharmacy, Guid> pharmacyRepository,
            IRepository<Shipment, Guid> shipmentRepository) : base(repository)
        {
            _orderItemRepository = orderItemRepository;
            _stockBatchRepository = stockBatchRepository;
            _stockMovementLogRepository = stockMovementLogRepository;
            _warehouseRepository = warehouseRepository;
            _pharmacyRepository = pharmacyRepository;
            _shipmentRepository = shipmentRepository;
        }

        // [B1] Sipariş oluştururken kalemleri de toplu oluştur + FIFO stok rezervasyonu (transaction ile)
        public override async Task<OrderDto> CreateAsync(CreateUpdateOrderDto input)
        {
            using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var order = new Order
            {
                PharmacyId = input.PharmacyId,
                CustomerId = input.CustomerId,
                WarehouseId = input.WarehouseId,
                OrderNumber = input.OrderNumber,
                OrderDate = input.OrderDate,
                Status = input.Status,
                Notes = input.Notes
            };

            order = await Repository.InsertAsync(order);

            if (input.Items != null && input.Items.Any())
            {
                foreach (var itemInput in input.Items)
                {
                    var item = new OrderItem
                    {
                        OrderId = order.Id,
                        DrugId = itemInput.DrugId,
                        RequestedQuantity = itemInput.RequestedQuantity,
                        ApprovedQuantity = itemInput.ApprovedQuantity
                    };
                    item = await _orderItemRepository.InsertAsync(item);

                    // Stok rezervasyonu (FIFO)
                    if (item.ApprovedQuantity > 0)
                    {
                        await ReserveStockForOrderItemAsync(item);
                    }
                }
            }

            scope.Complete();
            return await populateNames(ObjectMapper.Map<Order, OrderDto>(order));
        }

        /// <summary>
        /// Siparişi iptal eder ve rezerve edilmiş stokları serbest bırakır.
        /// Eğer sipariş zaten sevkiyata dönüşmüşse (Shipment.Delivered) iptal edilemez.
        /// </summary>
        [UnitOfWork]
        public async Task CancelOrderAsync(Guid orderId)
        {
            var order = await Repository.GetAsync(orderId);

            if (order.Status == OrderStatus.Cancelled)
            {
                return; // Already cancelled
            }

            // Check if shipment exists and is already dispatched/delivered
            var shipment = await _shipmentRepository.FirstOrDefaultAsync(s => s.OrderId == orderId);
            if (shipment != null && shipment.Status >= ShipmentStatus.Dispatched)
            {
                throw new UserFriendlyException("Bu sipariş sevkiyata çıkarıldı veya teslim edildi, iptal edilemez. İade sürecini kullanın.");
            }

            var orderItems = await _orderItemRepository.GetListAsync(i => i.OrderId == orderId);

            foreach (var item in orderItems)
            {
                if (item.ApprovedQuantity > 0)
                {
                    // Release reserved stock (FIFO - LIFO order for release to match reservation order)
                    await ReleaseStockReservationAsync(item.DrugId, item.ApprovedQuantity);
                }
            }

            // Mark as cancelled
            order.Status = OrderStatus.Cancelled;
            await Repository.UpdateAsync(order);
        }

        // [D5] 在返回 DTO 时补齐 PharmacyName / CustomerName / WarehouseName，避免前端 N+1 查询
        private async Task<OrderDto> populateNames(OrderDto dto)
        {
            if (dto != null)
            {
                var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Id == dto.PharmacyId);
                dto.PharmacyName = pharmacy?.Name;
                if (dto.WarehouseId.HasValue)
                {
                    var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Id == dto.WarehouseId.Value);
                    dto.WarehouseName = warehouse?.Name;
                }
            }
            return dto;
        }

        private async Task ReserveStockForOrderItemAsync(OrderItem item)
        {
            var batches = (await _stockBatchRepository.GetListAsync(b => b.DrugId == item.DrugId))
                .OrderBy(b => b.ExpirationDate)
                .ToList();

            int remaining = item.ApprovedQuantity;
            foreach (var batch in batches.Where(b => (b.Quantity - b.ReservedQuantity) > 0))
            {
                if (remaining <= 0) break;

                int available = batch.Quantity - batch.ReservedQuantity;
                int reserveAmount = Math.Min(available, remaining);

                batch.ReservedQuantity += reserveAmount;
                await _stockBatchRepository.UpdateAsync(batch);

                var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Id == batch.WarehouseId);
                string depoAdi = warehouse?.Name ?? "Merkez Depo";
                string sktTarihi = batch.ExpirationDate.ToString("dd.MM.yyyy");
                string aciklama = $"FIFO Onayı: {reserveAmount} kutu rezerve edildi. (Depo: {depoAdi}, Lot: {batch.LotNumber}, SKT: {sktTarihi})";

                await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                {
                    StockBatchId = batch.Id,
                    MovementType = StockMovementType.Dispatch,
                    QuantityChange = -reserveAmount,
                    Description = aciklama
                });

                remaining -= reserveAmount;
            }

            if (remaining > 0)
            {
                throw new UserFriendlyException($"Yetersiz stok! {remaining} kutu eksik kalacak.");
            }
        }

        private async Task ReleaseStockReservationAsync(Guid drugId, int quantityToRelease, int maxRetries = 3)
        {
            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                try
                {
                    var batches = (await _stockBatchRepository.GetListAsync(b => b.DrugId == drugId && b.ReservedQuantity > 0))
                        .OrderBy(b => b.ExpirationDate)
                        .ToList();

                    int remainingToRelease = quantityToRelease;

                    foreach (var batch in batches)
                    {
                        if (remainingToRelease <= 0) break;

                        int releaseAmount = Math.Min(batch.ReservedQuantity, remainingToRelease);

                        batch.ReservedQuantity -= releaseAmount;
                        await _stockBatchRepository.UpdateAsync(batch);

                        var warehouse = await _warehouseRepository.FirstOrDefaultAsync(w => w.Id == batch.WarehouseId);
                        string depoAdi = warehouse?.Name ?? "Merkez Depo";
                        string sktTarihi = batch.ExpirationDate.ToString("dd.MM.yyyy");
                        string aciklama = $"Sipariş iptali: {releaseAmount} kutu rezerve serbest bırakıldı. (Depo: {depoAdi}, Lot: {batch.LotNumber}, SKT: {sktTarihi})";

                        await _stockMovementLogRepository.InsertAsync(new StockMovementLog
                        {
                            StockBatchId = batch.Id,
                            MovementType = StockMovementType.ReturnIn,
                            QuantityChange = releaseAmount,
                            Description = aciklama
                        });

                        remainingToRelease -= releaseAmount;
                    }

                    if (remainingToRelease > 0)
                    {
                        // This shouldn't happen if data is consistent, but log it
                        throw new UserFriendlyException($"Tüm rezerve miktar serbest bırakılamadı. {remainingToRelease} kutu hala rezerve.");
                    }

                    return; // Success
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
}