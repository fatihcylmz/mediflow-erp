using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Returns;

public class ReturnDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public Guid InvoiceId { get; set; }
    public string TrackingNumber { get; set; }
    public DateTime ReturnDate { get; set; }
    public ReturnStatus Status { get; set; }
}