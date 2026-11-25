using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Orders;

public interface IOrderAppService : ICrudAppService<
    OrderDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateOrderDto>
{
    Task CancelOrderAsync(Guid orderId);
}