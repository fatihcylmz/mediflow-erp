using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Shipments;

public class ShipmentItem : CreationAuditedEntity<Guid>
{
    public Guid ShipmentId { get; set; } // Hangi Sevkiyatın (İrsaliyenin) satırı?
    
    public Guid StockBatchId { get; set; } // Hangi Lot'tan / Üretim Partisinden düştük?
    public int Quantity { get; set; } // Kaç kutu gönderdik?
}