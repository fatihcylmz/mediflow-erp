using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Returns;

public class ReturnItem : CreationAuditedEntity<Guid>
{
    public Guid ReturnId { get; set; }
    public Guid StockBatchId { get; set; } // Eczane hangi Lot'u bize geri gönderdi?
    public Guid DrugId { get; set; }
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; } = 8;
    public decimal LineTotal { get; set; }
    public ReturnReason Reason { get; set; }
}