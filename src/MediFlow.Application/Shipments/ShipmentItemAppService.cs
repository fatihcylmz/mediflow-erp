using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Shipments;

public class ShipmentItemAppService :
    CrudAppService<
        ShipmentItem,
        ShipmentItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateShipmentItemDto>,
    IShipmentItemAppService
{
    public ShipmentItemAppService(IRepository<ShipmentItem, Guid> repository)
        : base(repository)
    {
    }
}