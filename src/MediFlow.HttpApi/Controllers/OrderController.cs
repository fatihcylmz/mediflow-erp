using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Orders;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Orders)]
public class OrderController : AbpController
{
    private readonly OrderAppService _orderAppService;

    public OrderController(OrderAppService orderAppService)
    {
        _orderAppService = orderAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.OrdersView)]
    public Task<PagedResultDto<OrderDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _orderAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.OrdersView)]
    public Task<OrderDto> GetAsync(Guid id)
    {
        return _orderAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.OrdersCreate)]
    public Task<OrderDto> CreateAsync([FromBody] CreateUpdateOrderDto input)
    {
        return _orderAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.OrdersEdit)]
    public Task<OrderDto> UpdateAsync(Guid id, [FromBody] CreateUpdateOrderDto input)
    {
        return _orderAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.OrdersDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _orderAppService.DeleteAsync(id);
    }
}
