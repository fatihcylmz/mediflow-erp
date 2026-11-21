using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Application.Contracts.Payment;

public class PaymentMethodDto : EntityDto<Guid>
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public bool RequiresApproval { get; set; }
    public decimal? FeePercentage { get; set; }
}

public class CreateUpdatePaymentMethodDto
{
    public string Name { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public bool RequiresApproval { get; set; }
    public decimal? FeePercentage { get; set; }
}