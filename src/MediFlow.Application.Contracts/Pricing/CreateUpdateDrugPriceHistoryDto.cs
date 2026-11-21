using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Pricing;

public class CreateUpdateDrugPriceHistoryDto
{
    public Guid DrugId { get; set; }
    
    [Range(0.01, 1000000)]
    public decimal Price { get; set; }
    
    [Range(0, 100)]
    public decimal TaxRate { get; set; }
    
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsCoveredByStateInsurance { get; set; }
    
    [Range(0, 100)]
    public decimal StateCoveragePercentage { get; set; }
}
