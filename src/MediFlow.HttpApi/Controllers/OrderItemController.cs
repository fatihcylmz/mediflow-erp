using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Orders;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/order-item")]
public class OrderItemController : AbpController
{
    private readonly IOrderItemAppService _orderItemAppService;

    public OrderItemController(IOrderItemAppService orderItemAppService)
    {
        _orderItemAppService = orderItemAppService;
    }

    [HttpGet]
    public Task<PagedResultDto<OrderItemDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _orderItemAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public Task<OrderItemDto> GetAsync(Guid id)
    {
        return _orderItemAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<OrderItemDto> CreateAsync([FromBody] CreateUpdateOrderItemDto input)
    {
        return _orderItemAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<OrderItemDto> UpdateAsync(Guid id, [FromBody] CreateUpdateOrderItemDto input)
    {
        return _orderItemAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(Guid id)
    {
        return _orderItemAppService.DeleteAsync(id);
    }
}
