using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Shipments;

public class CreateUpdateShipmentItemDto
{
    [Required]
    public Guid ShipmentId { get; set; }

    [Required]
    public Guid StockBatchId { get; set; }

    [Required]
    public int Quantity { get; set; }
}