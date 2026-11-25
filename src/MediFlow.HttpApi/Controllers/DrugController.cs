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
[Authorize(MediFlowPermissions.Drugs)]
public class DrugController : AbpController
{
    private readonly DrugAppService _drugAppService;

    public DrugController(DrugAppService drugAppService)
    {
        _drugAppService = drugAppService;
    }

    [HttpGet]
    public async Task<PagedResultDto<DrugDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _drugAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public async Task<DrugDto> GetAsync(Guid id)
    {
        return await _drugAppService.GetAsync(id);
    }

    [HttpPost]
    public async Task<DrugDto> CreateAsync(CreateUpdateDrugDto input)
    {
        return await _drugAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public async Task<DrugDto> UpdateAsync(Guid id, CreateUpdateDrugDto input)
    {
        return await _drugAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _drugAppService.DeleteAsync(id);
    }
}