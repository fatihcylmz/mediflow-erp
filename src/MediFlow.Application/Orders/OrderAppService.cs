using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Inventories;
using MediFlow.Warehouses;
using MediFlow.Pharmacies;

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

        public OrderAppService(
            IRepository<Order, Guid> repository,
            IRepository<OrderItem, Guid> orderItemRepository,
            IRepository<StockBatch, Guid> stockBatchRepository,
            IRepository<StockMovementLog, Guid> stockMovementLogRepository,
            IRepository<Warehouse, Guid> warehouseRepository,
            IRepository<Pharmacy, Guid> pharmacyRepository) : base(repository)
        {
            _orderItemRepository = orderItemRepository;
            _stockBatchRepository = stockBatchRepository;
            _stockMovementLogRepository = stockMovementLogRepository;
            _warehouseRepository = warehouseRepository;
            _pharmacyRepository = pharmacyRepository;
        }

        // [B1] Sipariş oluştururken kalemleri de toplu oluştur + FIFO stok rezervasyonu
        public override async Task<OrderDto> CreateAsync(CreateUpdateOrderDto input)
        {
            var order = new Order
            {
                PharmacyId = input.PharmacyId,
                CustomerId = input.CustomerId,
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

            return await populateNames(ObjectMapper.Map<Order, OrderDto>(order));
        }

        // [D5] 在返回 DTO 时补齐 PharmacyName / CustomerName，避免前端 N+1 查询
        private async Task<OrderDto> populateNames(OrderDto dto)
        {
            if (dto != null)
            {
                var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Id == dto.PharmacyId);
                dto.PharmacyName = pharmacy?.Name;
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
    }
}