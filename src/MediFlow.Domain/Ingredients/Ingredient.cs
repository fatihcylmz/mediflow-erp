using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Drugs;

public class Ingredient : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } // Örn: "Acetylsalicylic acid", "Sodium Bicarbonate"
    public string Description { get; set; } // Madde hakkında genel kimyasal bilgi
    public IngredientType Type { get; set; }
}