using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Application.Contracts.Payment;

public class PaymentTransactionDto : EntityDto<Guid>
{
    public Guid? InvoiceId { get; set; }
    public Guid? SaleId { get; set; }
    public Guid PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
    public decimal FeeAmount { get; set; }
    public decimal NetAmount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string TransactionReference { get; set; }
    public string Notes { get; set; }
    public int Status { get; set; }
}

public class CreateUpdatePaymentTransactionDto
{
    // Fatura/satış referansı isteğe bağlıdır: ÖdemeTransaction,
    // fatura/satış referanslı DAHA İSTİNDEKİ BAĞIMSIZ şekilde işlem görebilir.
    public Guid? InvoiceId { get; set; }
    public Guid? SaleId { get; set; }
    public Guid PaymentMethodId { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string TransactionReference { get; set; }
    public string Notes { get; set; }
    public int Status { get; set; }
}
