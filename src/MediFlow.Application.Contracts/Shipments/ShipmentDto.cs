using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Shipments;

public class ShipmentDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public string? PharmacyName { get; set; } // [D5] N+1 önleme
    public Guid? OrderId { get; set; }
    public string? OrderNumber { get; set; } // [D5] N+1 önleme
    public string TrackingNumber { get; set; }
    public DateTime ShipmentDate { get; set; }
    public ShipmentStatus Status { get; set; }
    public DateTime? DeliveryDate { get; set; }
}