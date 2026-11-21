using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Returns;

public class ReturnItemDto : EntityDto<Guid>
{
    public Guid ReturnId { get; set; }
    public Guid StockBatchId { get; set; }
    public int Quantity { get; set; }
    public ReturnReason Reason { get; set; }
}