using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Prescriptions;

public class CreateUpdatePrescriptionDto
{
    // Reçeteyi işleyen eczane (PharmacyAdmin/Sales otomatik kendi eczanesi; Admin null bırakabilir)
    public Guid? PharmacyId { get; set; }

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