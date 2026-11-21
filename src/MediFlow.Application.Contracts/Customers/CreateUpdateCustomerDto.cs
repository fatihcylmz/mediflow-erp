using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Customers;

public class CreateUpdateCustomerDto
{
    [Required]
    [StringLength(11)]
    public string IdentityNumber { get; set; }

    [Required]
    [StringLength(64)]
    public string FirstName { get; set; }

    [Required]
    [StringLength(64)]
    public string LastName { get; set; }

    [StringLength(20)]
    public string PhoneNumber { get; set; }

    public DateTime DateOfBirth { get; set; }
}