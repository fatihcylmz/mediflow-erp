using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Orders;

public class CreateUpdateOrderItemDto
{
    [Required]
    public Guid OrderId { get; set; }

    [Required]
    public Guid DrugId { get; set; }

    [Required]
    public int RequestedQuantity { get; set; }

    [Required]
    public int ApprovedQuantity { get; set; }
}