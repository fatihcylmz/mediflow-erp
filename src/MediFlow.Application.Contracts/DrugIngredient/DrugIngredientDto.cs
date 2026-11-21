using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Drugs;

// Entity'miz CreationAuditedEntity olduğu için DTO da onun Dto'sundan miras alıyor
public class DrugIngredientDto : CreationAuditedEntityDto<Guid>
{
    public Guid DrugId { get; set; }
    public Guid IngredientId { get; set; }
    public decimal Amount { get; set; }
    public string Unit { get; set; }
}