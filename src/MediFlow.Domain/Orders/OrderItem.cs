using System;
using Volo.Abp.Domain.Entities.Auditing;
using MediFlow.Inventories;
using MediFlow.Drugs;

namespace MediFlow.Orders;

public class OrderItem : CreationAuditedEntity<Guid>
{
    public Guid OrderId { get; set; }
    public Guid DrugId { get; set; }
    public Guid? StockBatchId { get; set; } // Hangi Lot'tan rezerve edildi?

    // Navigation properties
    public StockBatch StockBatch { get; set; }
    public Drug Drug { get; set; }

    public int RequestedQuantity { get; set; } // Eczanenin istediği
    public int ApprovedQuantity { get; set; } // Deponun onayladığı (Stokta o an 50 istenmiş ama 30 kalmış olabilir)
}