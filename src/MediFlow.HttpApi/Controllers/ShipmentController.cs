using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Shipments;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Shipments)]
public class ShipmentController : AbpController
{
    private readonly ShipmentAppService _shipmentAppService;

    public ShipmentController(ShipmentAppService shipmentAppService)
    {
        _shipmentAppService = shipmentAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.ShipmentsView)]
    public Task<PagedResultDto<ShipmentDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _shipmentAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.ShipmentsView)]
    public Task<ShipmentDto> GetAsync(Guid id)
    {
        return _shipmentAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.ShipmentsCreate)]
    public Task<ShipmentDto> CreateAsync([FromBody] CreateUpdateShipmentDto input)
    {
        return _shipmentAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.ShipmentsEdit)]
    public Task<ShipmentDto> UpdateAsync(Guid id, [FromBody] CreateUpdateShipmentDto input)
    {
        return _shipmentAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.ShipmentsDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _shipmentAppService.DeleteAsync(id);
    }
}