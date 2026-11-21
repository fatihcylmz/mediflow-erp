using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Sales;

public class CreateUpdateSaleItemDto
{
    [Required]
    public Guid SaleId { get; set; }

    [Required]
    public Guid StockBatchId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    public decimal UnitPrice { get; set; }
}