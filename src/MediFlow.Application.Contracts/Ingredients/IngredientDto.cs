using System;
using Volo.Abp.Application.Dtos;
using MediFlow.Drugs;


namespace MediFlow.Ingredients;

public class IngredientDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string Description { get; set; }
    public IngredientType Type { get; set; }
}