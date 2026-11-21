using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Inventories;
using MediFlow.Pharmacies;
using MediFlow.Orders; 

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

        public ShipmentAppService(
            IRepository<Shipment, Guid> repository,
            IRepository<OrderItem, Guid> orderItemRepository,
            IRepository<StockBatch, Guid> stockBatchRepository,
            IRepository<StockMovementLog, Guid> stockMovementLogRepository,
            IRepository<PharmacyStock, Guid> pharmacyStockRepository,
            IRepository<ShipmentItem, Guid> shipmentItemRepository) : base(repository)
        {
            _orderItemRepository = orderItemRepository;
            _stockBatchRepository = stockBatchRepository;
            _stockMovementLogRepository = stockMovementLogRepository;
            _pharmacyStockRepository = pharmacyStockRepository;
            _shipmentItemRepository = shipmentItemRepository;
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

        public override async Task<ShipmentDto> UpdateAsync(Guid id, CreateUpdateShipmentDto input)
        {
            var existingShipment = await Repository.GetAsync(id);
            var oldStatus = existingShipment.Status;

            var result = await base.UpdateAsync(id, input);

            var deliveredStatus = (ShipmentStatus)2; // Eczane Teslim Aldı

            // EĞER SEVKİYAT "TESLİM ALINDI" Olarak ONAYLANDIYSA:
            if (input.Status == deliveredStatus && oldStatus != deliveredStatus)
            {
                if (existingShipment.OrderId.HasValue)
                {
                    // Siparişteki ilaçları çekiyoruz
                    var orderItems = await _orderItemRepository.GetListAsync(x => x.OrderId == existingShipment.OrderId.Value);

                    foreach (var item in orderItems)
                    {
                        var quantityToDeduct = item.ApprovedQuantity > 0 ? item.ApprovedQuantity : item.RequestedQuantity;
                        if (quantityToDeduct <= 0) continue;

                        // FIFO MANTIĞI: Bu ilaca ait (DrugId) stokta olan lotları SKT'ye (ExpirationDate) göre sırala
                        var availableBatchesQuery = await _stockBatchRepository.GetQueryableAsync();
                        var availableBatches = availableBatchesQuery
                            .Where(x => x.DrugId == item.DrugId && x.Quantity > 0)
                            .OrderBy(x => x.ExpirationDate)
                            .ToList();

                        var remainingQuantity = quantityToDeduct;

                        // İstenen miktarı karşılayana kadar lotlardan düşmeye başla
                        foreach (var batch in availableBatches)
                        {
                            if (remainingQuantity <= 0) break;

                            var deductedAmount = Math.Min(batch.Quantity, remainingQuantity);

                            // 1. Fiili Depo Miktarından ve Rezervasyondan Düş
                            batch.Quantity -= deductedAmount;
                            batch.ReservedQuantity -= deductedAmount;
                            if (batch.ReservedQuantity < 0) batch.ReservedQuantity = 0;

                            await _stockBatchRepository.UpdateAsync(batch);

                            // 2. [K3] ShipmentItem kaydı oluştur (şimdi var!)
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
                                MovementType = (StockMovementType)1,
                                QuantityChange = -deductedAmount,
                                ReferenceId = existingShipment.Id,
                                Description = $"Takip No: {existingShipment.TrackingNumber} ile eczaneye teslim edildi."
                            });

                            // 4. Eczane Raf Stokuna (PharmacyStock) Ekle / Güncelle
                            var existingPharmacyStock = await _pharmacyStockRepository.FirstOrDefaultAsync(
                                x => x.PharmacyId == existingShipment.PharmacyId &&
                                     x.DrugId == batch.DrugId &&
                                     x.LotNumber == batch.LotNumber
                            );

                            if (existingPharmacyStock != null)
                            {
                                existingPharmacyStock.Quantity += deductedAmount;
                                await _pharmacyStockRepository.UpdateAsync(existingPharmacyStock);
                            }
                            else
                            {
                                await _pharmacyStockRepository.InsertAsync(new PharmacyStock
                                {
                                    PharmacyId = existingShipment.PharmacyId,
                                    DrugId = batch.DrugId,
                                    LotNumber = batch.LotNumber,
                                    ExpirationDate = batch.ExpirationDate,
                                    Quantity = deductedAmount
                                });
                            }

                            remainingQuantity -= deductedAmount;
                        }
                    }
                }
            }

            return result;
        }
    }
}