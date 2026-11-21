using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Orders;

public class OrderItemDto : EntityDto<Guid>
{
    public Guid OrderId { get; set; }
    public Guid DrugId { get; set; }
    public int RequestedQuantity { get; set; }
    public int ApprovedQuantity { get; set; }
}