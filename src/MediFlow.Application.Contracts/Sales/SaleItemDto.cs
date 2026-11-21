using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Sales;

public class SaleItemDto : CreationAuditedEntityDto<Guid>
{
    public Guid SaleId { get; set; }
    public Guid StockBatchId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}