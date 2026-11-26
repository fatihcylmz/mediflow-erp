using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Prescriptions;

public class PrescriptionDto : FullAuditedEntityDto<Guid>
{
    public Guid? PharmacyId { get; set; }
    public string? PharmacyName { get; set; } // [D5] N+1 önleme
    public Guid CustomerId { get; set; }
    public string EPrescriptionNumber { get; set; }
    public string DoctorName { get; set; }
    public string DoctorDiplomaNumber { get; set; }
    public string HospitalName { get; set; }
    public DateTime IssueDate { get; set; }
}