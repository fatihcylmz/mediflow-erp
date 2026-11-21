using System;
using Volo.Abp.Application.Dtos;
// Enum'ları taşıdığın Domain.Shared namespace'ini buraya ekle (Örn: using MediFlow.Drugs;)

namespace MediFlow.Drugs;

public class DrugDto : FullAuditedEntityDto<Guid>
{
    public Guid SupplierId { get; set; }
    public string Name { get; set; }
    public string Barcode { get; set; }
    public string ATCCode { get; set; }
    public DrugForm Form { get; set; }
    public decimal Dosage { get; set; }
    public string DosageUnit { get; set; }
    public PrescriptionType PrescriptionType { get; set; }
    public bool RequiresColdChain { get; set; }
    public int ShelfLifeInMonths { get; set; }
    public int UnitsPerBox { get; set; }
    public int MinimumStockLevel { get; set; }
}