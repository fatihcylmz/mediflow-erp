using System.ComponentModel.DataAnnotations;

namespace MediFlow.Suppliers;

public class CreateUpdateSupplierDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; }

    [StringLength(50)]
    public string TaxNumber { get; set; }

    [StringLength(100)]
    public string ContactName { get; set; }

    [StringLength(100)]
    public string ContactSurname { get; set; }

    [StringLength(20)]
    public string PhoneNumber { get; set; }

    [EmailAddress]
    public string Email { get; set; }
}