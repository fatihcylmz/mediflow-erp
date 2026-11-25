using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Warehouses;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Warehouses)]
public class WarehouseController : AbpController
{
    private readonly WarehouseAppService _warehouseAppService;

    public WarehouseController(WarehouseAppService warehouseAppService)
    {
        _warehouseAppService = warehouseAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.WarehousesView)]
    public Task<PagedResultDto<WarehouseDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _warehouseAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.WarehousesView)]
    public Task<WarehouseDto> GetAsync(Guid id)
    {
        return _warehouseAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.WarehousesCreate)]
    public Task<WarehouseDto> CreateAsync([FromBody] CreateUpdateWarehouseDto input)
    {
        return _warehouseAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.WarehousesEdit)]
    public Task<WarehouseDto> UpdateAsync(Guid id, [FromBody] CreateUpdateWarehouseDto input)
    {
        return _warehouseAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.WarehousesDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _warehouseAppService.DeleteAsync(id);
    }
}