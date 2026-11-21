using System;
using System.ComponentModel.DataAnnotations;
// Enum namespace'ini buraya ekle

namespace MediFlow.Drugs;

public class CreateUpdateDrugDto
{
    [Required]
    public Guid SupplierId { get; set; }
    
    [Required]
    public string Name { get; set; }
    
    public string Barcode { get; set; }
    public string ATCCode { get; set; }
    public DrugForm Form { get; set; }
    public decimal Dosage { get; set; }
    public string DosageUnit { get; set; }
    public PrescriptionType PrescriptionType { get; set; }
    public bool RequiresColdChain { get; set; }
    public int ShelfLifeInMonths { get; set; }
    public int UnitsPerBox { get; set; }
    public int MinimumStockLevel { get; set; }
}