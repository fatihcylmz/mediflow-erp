using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using MediFlow.Drugs; // Entity ve Enum'ları görmesi için

namespace MediFlow.Ingredients;

public class IngredientAppService : CrudAppService<
    Ingredient, 
    IngredientDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdateIngredientDto>, IIngredientAppService
{
    public IngredientAppService(IRepository<Ingredient, Guid> repository) : base(repository)
    {
    }
}