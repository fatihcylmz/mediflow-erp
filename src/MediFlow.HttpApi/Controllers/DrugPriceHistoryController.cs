using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Pricing;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/drug-price-history")]
[Authorize(MediFlowPermissions.Pricing)]
public class DrugPriceHistoryController : AbpController
{
    private readonly IDrugPriceHistoryAppService _drugPriceHistoryAppService;

    public DrugPriceHistoryController(IDrugPriceHistoryAppService drugPriceHistoryAppService)
    {
        _drugPriceHistoryAppService = drugPriceHistoryAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.PricingView)]
    public Task<PagedResultDto<DrugPriceHistoryDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _drugPriceHistoryAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.PricingView)]
    public Task<DrugPriceHistoryDto> GetAsync(Guid id)
    {
        return _drugPriceHistoryAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.PricingManage)]
    public Task<DrugPriceHistoryDto> CreateAsync([FromBody] CreateUpdateDrugPriceHistoryDto input)
    {
        return _drugPriceHistoryAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.PricingManage)]
    public Task<DrugPriceHistoryDto> UpdateAsync(Guid id, [FromBody] CreateUpdateDrugPriceHistoryDto input)
    {
        return _drugPriceHistoryAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.PricingManage)]
    public Task DeleteAsync(Guid id)
    {
        return _drugPriceHistoryAppService.DeleteAsync(id);
    }
}