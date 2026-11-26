using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Drugs;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/drug-ingredient")]
[Authorize(MediFlowPermissions.Drugs)]
public class DrugIngredientController : AbpController
{
    private readonly IDrugIngredientAppService _drugIngredientAppService;

    public DrugIngredientController(IDrugIngredientAppService drugIngredientAppService)
    {
        _drugIngredientAppService = drugIngredientAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.DrugsView)]
    public Task<PagedResultDto<DrugIngredientDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _drugIngredientAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.DrugsView)]
    public Task<DrugIngredientDto> GetAsync(Guid id)
    {
        return _drugIngredientAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.DrugsCreate)]
    public Task<DrugIngredientDto> CreateAsync([FromBody] CreateUpdateDrugIngredientDto input)
    {
        return _drugIngredientAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.DrugsEdit)]
    public Task<DrugIngredientDto> UpdateAsync(Guid id, [FromBody] CreateUpdateDrugIngredientDto input)
    {
        return _drugIngredientAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.DrugsDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _drugIngredientAppService.DeleteAsync(id);
    }
}
