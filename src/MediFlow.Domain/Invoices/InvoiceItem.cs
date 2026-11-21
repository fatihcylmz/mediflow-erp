using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Invoices;

public class InvoiceItem : FullAuditedEntity<Guid>
{
    public Guid InvoiceId { get; set; } 
    public Guid DrugId { get; set; } 
    public Guid? StockBatchId { get; set; } 
    public int Quantity { get; set; } 
    public decimal UnitPrice { get; set; } 
    public decimal TaxRate { get; set; } 
    public decimal LineTotal { get; set; } 
}