using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Prescriptions;

public class CreateUpdatePrescriptionDto
{
    public Guid CustomerId { get; set; }

    [Required]
    [StringLength(50)]
    public string EPrescriptionNumber { get; set; }

    [StringLength(128)]
    public string DoctorName { get; set; }

    [StringLength(50)]
    public string DoctorDiplomaNumber { get; set; }

    [StringLength(128)]
    public string HospitalName { get; set; }

    public DateTime IssueDate { get; set; }
}