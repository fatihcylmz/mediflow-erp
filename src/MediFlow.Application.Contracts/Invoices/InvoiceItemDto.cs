using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Invoices;

public class InvoiceItemDto : EntityDto<Guid>
{
    public Guid DrugId { get; set; }
    public Guid StockBatchId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
    public decimal LineTotal { get; set; }
}