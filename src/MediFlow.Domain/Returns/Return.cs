using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Returns;

public class Return : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; } // İadeyi yapan eczane
    public Guid InvoiceId { get; set; }
    public required string TrackingNumber { get; set; } // Kargo takip no
    public DateTime ReturnDate { get; set; }
    
    public ReturnStatus Status { get; set; } = ReturnStatus.InReview;
}