using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Drugs;

public class CreateUpdateDrugIngredientDto
{
    [Required]
    public Guid DrugId { get; set; }

    [Required]
    public Guid IngredientId { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(50)] // Birimi sınırlandıralım (örn: mg, ml, mcg)
    public string Unit { get; set; }
}