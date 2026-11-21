using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Pricing;

public class DrugPriceHistoryDto : FullAuditedEntityDto<Guid>
{
    public Guid DrugId { get; set; }
    public decimal Price { get; set; }
    public decimal TaxRate { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsCoveredByStateInsurance { get; set; }
    public decimal StateCoveragePercentage { get; set; }
}
