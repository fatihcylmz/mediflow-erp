using System;
using System.Collections.Generic; // ICollection ve List için gerekli
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Invoices;

public class Invoice : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; }
    public Guid ShipmentId { get; set; } // Hangi teslimatın faturası?
    
    public string InvoiceNumber { get; set; } // Resmi Fatura/e-Arşiv Numarası
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; } // Son ödeme tarihi (Vade)
    
    public decimal SubTotal { get; set; } // Vergisiz Tutar
    public decimal TaxTotal { get; set; } // Toplam KDV
    public decimal GrandTotal { get; set; } // Genel Toplam
    
    public InvoiceStatus Status { get; set; }

    // Eklenen kısımlar:
    public virtual ICollection<InvoiceItem> Items { get; set; }

    public Invoice()
    {
        Items = new List<InvoiceItem>();
    }
}