using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Pharmacies;

public class CreateUpdatePharmacyStockDto
{
    [Required]
    public Guid PharmacyId { get; set; }

    [Required]
    public Guid DrugId { get; set; }

    [Required]
    [StringLength(50)] // Lot numarası için makul bir sınır
    public string LotNumber { get; set; }

    [Required]
    public DateTime ExpirationDate { get; set; }

    [Required]
    public int Quantity { get; set; }
}