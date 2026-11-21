using System.ComponentModel.DataAnnotations;

namespace MediFlow.Pharmacies;

public class CreateUpdatePharmacyDto
{
    [Required]
    [StringLength(128)]
    public string Name { get; set; }

    [Required]
    [StringLength(13)]
    public string GLN { get; set; }

    [StringLength(50)]
    public string TaxNumber { get; set; }

    public string PharmacistName { get; set; }
    public string PharmacistLicenseNumber { get; set; }
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
}