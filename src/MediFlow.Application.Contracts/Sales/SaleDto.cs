using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Sales;

public class SaleDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public string? PharmacyName { get; set; } // [D5]
    public Guid CustomerId { get; set; }
    public string? CustomerName { get; set; } // [D5]
    public Guid? PrescriptionId { get; set; }
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid? InvoiceId { get; set; } // İlişkili fatura ID
}
