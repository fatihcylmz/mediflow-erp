using System;
using Volo.Abp.Domain.Entities.Auditing;
using MediFlow.Invoices;
using MediFlow.Sales;

namespace MediFlow.Payment;

public class PaymentTransaction : FullAuditedAggregateRoot<Guid>
{
    // Fatura BAĞLAMI bağımsız (standalone) olabileceği için nullable:
    // ÖdemeTransaction, fatura/satış referanslı DAHA İSTİNDEKİ BAĞIMSIZ şekilde
    // (örn. eczane kasasına gelen nakit giriş) işlem görebilir.
    public Guid? InvoiceId { get; set; }
    public Guid? SaleId { get; set; } // Satış referansı (faturası olmayan satışlar için)
    public Guid PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
    public decimal FeeAmount { get; set; } // Ödeme yöntemi ücreti
    public decimal NetAmount { get; set; } // Net tutar (Amount - FeeAmount)
    public DateTime PaymentDate { get; set; }
    public string TransactionReference { get; set; } // Banka/Kart referans numarası
    public string Notes { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    // Navigation Properties (İlişki Bağlantıları)
    public virtual Invoice? Invoice { get; set; }
    public virtual PaymentMethod PaymentMethod { get; set; }
}

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3,
    Cancelled = 4
}