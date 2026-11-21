using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Inventories;

public class StockMovementLogDto : CreationAuditedEntityDto<Guid>
{
    public Guid StockBatchId { get; set; }
    public StockMovementType MovementType { get; set; }
    public int QuantityChange { get; set; }
    public Guid? ReferenceId { get; set; }
    public string Description { get; set; }
}