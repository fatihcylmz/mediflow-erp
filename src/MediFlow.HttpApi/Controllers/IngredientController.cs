using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Ingredients;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Ingredients)]
public class IngredientController : AbpController
{
    private readonly IngredientAppService _ingredientAppService;

    public IngredientController(IngredientAppService ingredientAppService)
    {
        _ingredientAppService = ingredientAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.IngredientsView)]
    public Task<PagedResultDto<IngredientDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _ingredientAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.IngredientsView)]
    public Task<IngredientDto> GetAsync(Guid id)
    {
        return _ingredientAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.IngredientsCreate)]
    public Task<IngredientDto> CreateAsync([FromBody] CreateUpdateIngredientDto input)
    {
        return _ingredientAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.IngredientsEdit)]
    public Task<IngredientDto> UpdateAsync(Guid id, [FromBody] CreateUpdateIngredientDto input)
    {
        return _ingredientAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.IngredientsDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _ingredientAppService.DeleteAsync(id);
    }
}