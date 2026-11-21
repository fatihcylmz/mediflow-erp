using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Inventories;

public class CreateUpdateStockMovementLogDto
{
    [Required]
    public Guid StockBatchId { get; set; }
    
    [Required]
    public StockMovementType MovementType { get; set; }
    
    [Required]
    public int QuantityChange { get; set; }
    
    public Guid? ReferenceId { get; set; }
    public string Description { get; set; }
}