using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Orders
{

public interface IOrderItemAppService :
    ICrudAppService<
        OrderItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateOrderItemDto>
{
}
}