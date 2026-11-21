using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Inventories;

public class StockBatchDto : FullAuditedEntityDto<Guid>
{
    public Guid DrugId { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid SupplierId { get; set; }
    public string LotNumber { get; set; }
    public DateTime ExpirationDate { get; set; }
    public int Quantity { get; set; }
    public int ReservedQuantity { get; set; }
    public string ShelfLocation { get; set; }
    public bool IsQuarantined { get; set; }
}