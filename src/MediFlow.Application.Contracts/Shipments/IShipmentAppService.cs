using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Shipments;

public interface IShipmentAppService : ICrudAppService<ShipmentDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateShipmentDto>
{
}