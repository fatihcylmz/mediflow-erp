using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Drugs;

public class DrugIngredient : CreationAuditedEntity<Guid>
{
    public Guid DrugId { get; set; } // Hangi İlaç?
    public Guid IngredientId { get; set; } // İçindeki Hangi Madde?
    
    public decimal Amount { get; set; } // Örn: 500
    public string Unit { get; set; } // Örn: "mg", "ml", "mcg"
}