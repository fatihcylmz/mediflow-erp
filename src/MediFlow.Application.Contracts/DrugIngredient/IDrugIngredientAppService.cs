using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Drugs;

public interface IDrugIngredientAppService :
    ICrudAppService<
        DrugIngredientDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateDrugIngredientDto>
{
}