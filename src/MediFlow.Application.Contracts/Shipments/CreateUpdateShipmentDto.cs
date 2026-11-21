using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Shipments;

public class CreateUpdateShipmentDto
{
    public Guid PharmacyId { get; set; }
    public Guid? OrderId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string TrackingNumber { get; set; }
    
    public DateTime ShipmentDate { get; set; }
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Preparing;
    public DateTime? DeliveryDate { get; set; }
}