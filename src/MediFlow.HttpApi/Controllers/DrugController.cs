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
[Route("api/app/[controller]")]
public class DrugController : AbpController
{
    private readonly DrugAppService _drugAppService;

    public DrugController(DrugAppService drugAppService)
    {
        _drugAppService = drugAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.DrugsView)]
    public async Task<PagedResultDto<DrugDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _drugAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.DrugsView)]
    public async Task<DrugDto> GetAsync(Guid id)
    {
        return await _drugAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.DrugsCreate)]
    public async Task<DrugDto> CreateAsync(CreateUpdateDrugDto input)
    {
        return await _drugAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.DrugsEdit)]
    public async Task<DrugDto> UpdateAsync(Guid id, CreateUpdateDrugDto input)
    {
        return await _drugAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.DrugsDelete)]
    public async Task DeleteAsync(Guid id)
    {
        await _drugAppService.DeleteAsync(id);
    }
}