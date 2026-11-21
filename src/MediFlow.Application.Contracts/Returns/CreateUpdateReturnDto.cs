using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Returns;

public class CreateUpdateReturnDto
{
    [Required]
    public Guid PharmacyId { get; set; }

    [Required]
    public Guid InvoiceId { get; set; }

    [Required]
    [StringLength(100)]
    public  string TrackingNumber { get; set; }

    public DateTime ReturnDate { get; set; }

    public ReturnStatus Status { get; set; } = ReturnStatus.InReview; 
}