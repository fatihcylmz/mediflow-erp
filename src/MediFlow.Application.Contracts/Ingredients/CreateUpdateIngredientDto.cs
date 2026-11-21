using System;
using System.ComponentModel.DataAnnotations;
using MediFlow.Drugs;

namespace MediFlow.Ingredients;

public class CreateUpdateIngredientDto
{
    [Required]
    public string Name { get; set; }
    
    public string Description { get; set; }
    
    public IngredientType Type { get; set; }
}