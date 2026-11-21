using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Inventories;

public class CreateUpdateStockBatchDto
{
    [Required]
    public Guid DrugId { get; set; }
    
    [Required]
    public Guid WarehouseId { get; set; }
    
    [Required]
    public Guid SupplierId { get; set; }
    
    [Required]
    public string LotNumber { get; set; }
    
    public DateTime ExpirationDate { get; set; }
    public int Quantity { get; set; }
    public int ReservedQuantity { get; set; }
    public string ShelfLocation { get; set; }
    public bool IsQuarantined { get; set; }
}