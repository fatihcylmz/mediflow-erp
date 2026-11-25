using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Sales;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/sale-item")]
public class SaleItemController : AbpController
{
    private readonly ISaleItemAppService _saleItemAppService;

    public SaleItemController(ISaleItemAppService saleItemAppService)
    {
        _saleItemAppService = saleItemAppService;
    }

    [HttpGet]
    public Task<PagedResultDto<SaleItemDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _saleItemAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public Task<SaleItemDto> GetAsync(Guid id)
    {
        return _saleItemAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<SaleItemDto> CreateAsync([FromBody] CreateUpdateSaleItemDto input)
    {
        return _saleItemAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<SaleItemDto> UpdateAsync(Guid id, [FromBody] CreateUpdateSaleItemDto input)
    {
        return _saleItemAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(Guid id)
    {
        return _saleItemAppService.DeleteAsync(id);
    }
}
