using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Shipments;

public interface IShipmentItemAppService :
    ICrudAppService<
        ShipmentItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateShipmentItemDto>
{
}