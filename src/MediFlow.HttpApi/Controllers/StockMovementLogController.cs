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
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Inventory)]
public class StockMovementLogController : AbpController
{
    private readonly StockMovementLogAppService _stockMovementLogAppService;

    public StockMovementLogController(StockMovementLogAppService stockMovementLogAppService)
    {
        _stockMovementLogAppService = stockMovementLogAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.InventoryView)]
    public Task<PagedResultDto<StockMovementLogDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _stockMovementLogAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.InventoryView)]
    public Task<StockMovementLogDto> GetAsync(Guid id)
    {
        return _stockMovementLogAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task<StockMovementLogDto> CreateAsync([FromBody] CreateUpdateStockMovementLogDto input)
    {
        return _stockMovementLogAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task<StockMovementLogDto> UpdateAsync(Guid id, [FromBody] CreateUpdateStockMovementLogDto input)
    {
        return _stockMovementLogAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.InventoryManage)]
    public Task DeleteAsync(Guid id)
    {
        return _stockMovementLogAppService.DeleteAsync(id);
    }
}