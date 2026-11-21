using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Ingredients;

public interface IIngredientAppService : ICrudAppService<IngredientDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateIngredientDto>
{
}