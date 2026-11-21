using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Payment;

public class PaymentMethod : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } // Örn: "Nakit", "Kredi Kartı", "Banka Havalesi"
    public string Code { get; set; }  // Örn: "CASH", "CREDIT_CARD", "BANK_TRANSFER"
    public string Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool RequiresApproval { get; set; } = false; // Ödeme onay gerektiriyorsa
    public decimal? FeePercentage { get; set; } // İşlem fee'si (örn: %2.9)
}