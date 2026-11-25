using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Inventories;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/stock-batch")]
[Authorize(MediFlowPermissions.Inventory)]
public class StockBatchController : AbpController
{
    private readonly StockBatchAppService _stockBatchAppService;

    public StockBatchController(StockBatchAppService stockBatchAppService)
    {
        _stockBatchAppService = stockBatchAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.InventoryView)]
    public Task<PagedResultDto<StockBatchDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _stockBatchAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.InventoryView)]
    public Task<StockBatchDto> GetAsync(Guid id)
    {
        return _stockBatchAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task<StockBatchDto> CreateAsync([FromBody] CreateUpdateStockBatchDto input)
    {
        return _stockBatchAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task<StockBatchDto> UpdateAsync(Guid id, [FromBody] CreateUpdateStockBatchDto input)
    {
        return _stockBatchAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task DeleteAsync(Guid id)
    {
        return _stockBatchAppService.DeleteAsync(id);
    }
}