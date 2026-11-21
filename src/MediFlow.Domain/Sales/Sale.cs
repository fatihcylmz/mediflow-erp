using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Sales;

public class Sale : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; } // Satışı yapan Eczane
    public Guid CustomerId { get; set; } // Alan Hasta/Müşteri
    public Guid? PrescriptionId { get; set; } // Reçete ID. (Soru işareti (?) koyduk çünkü ağrı kesici gibi OTC ilaçlar reçetesiz de satılabilir)
    
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; } // Toplam Tutar

    public Guid? InvoiceId { get; set; } // İlişkili fatura (Invoice→Sale zinciri)
}