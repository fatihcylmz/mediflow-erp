using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Shipments;

public class ShipmentItemDto : CreationAuditedEntityDto<Guid>
{
    public Guid ShipmentId { get; set; }
    public Guid StockBatchId { get; set; }
    public int Quantity { get; set; }
}