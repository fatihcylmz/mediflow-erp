using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Orders;

public interface IOrderAppService : ICrudAppService<
    OrderDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdateOrderDto>
{
}