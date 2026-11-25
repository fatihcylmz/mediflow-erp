using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Inventories;

public class StockMovementLog : CreationAuditedEntity<Guid>
{
    public Guid StockBatchId { get; set; } // Hangi lot işlem gördü?

    public StockMovementType MovementType { get; set; }
    public int QuantityChange { get; set; } // Değişen miktar (Örn: 50)

    // Bu hareketin kaynağı ne? (Order / Shipment / Invoice / Sale / Return)
    public StockMovementReferenceType ReferenceType { get; set; }

    // Bu hareketin kaynağı ID'si (ReferenceType'a göre değişir)
    public Guid? ReferenceId { get; set; }

    public string Description { get; set; } // Örn: "Şifa Eczanesi S-1004 numaralı sevkiyat çıkışı"
}