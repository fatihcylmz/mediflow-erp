using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Sales;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Sales)]
public class SaleController : AbpController
{
    private readonly SaleAppService _saleAppService;

    public SaleController(SaleAppService saleAppService)
    {
        _saleAppService = saleAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.SalesView)]
    public Task<PagedResultDto<SaleDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _saleAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.SalesView)]
    public Task<SaleDto> GetAsync(Guid id)
    {
        return _saleAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.SalesCreate)]
    public Task<SaleDto> CreateAsync([FromBody] CreateUpdateSaleDto input)
    {
        return _saleAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.SalesEdit)]
    public Task<SaleDto> UpdateAsync(Guid id, [FromBody] CreateUpdateSaleDto input)
    {
        return _saleAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.SalesDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _saleAppService.DeleteAsync(id);
    }

    [HttpPost("{id}/cancel")]
    [Authorize(MediFlowPermissions.SalesCancel)]
    public Task CancelSaleAsync(Guid id)
    {
        return _saleAppService.CancelSaleAsync(id);
    }
}