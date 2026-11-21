using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Pricing;

public class DrugPriceHistory : FullAuditedAggregateRoot<Guid>
{
    public Guid DrugId { get; set; }
    
    public decimal Price { get; set; }
    public decimal TaxRate { get; set; } // KDV oranı (Örn: %8)
    
    // Bu fiyat hangi tarihler arasında geçerliydi?
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; } // Null ise "şu anki güncel fiyat" demektir.
    
    // YENİ: SGK ödeme kapsamında mı?
    public bool IsCoveredByStateInsurance { get; set; } 
    public decimal StateCoveragePercentage { get; set; } // Devlet yüzde kaçını ödüyor? (Örn: %80)
}