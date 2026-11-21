using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Warehouses;

public class WarehouseDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string LocationAddress { get; set; }
    public string ManagerName { get; set; }
    public bool HasColdStorage { get; set; }
}