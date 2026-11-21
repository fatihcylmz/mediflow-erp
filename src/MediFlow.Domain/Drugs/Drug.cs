using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Drugs;

public class Drug : FullAuditedAggregateRoot<Guid>
{
    public Guid SupplierId { get; set; } 
    
    public string Name { get; set; } 
    public string Barcode { get; set; } 
    public string ATCCode { get; set; } // YENİ: Uluslararası Anatomik Terapötik Kimyasal Kodu
    
    public DrugForm Form { get; set; } 
    public decimal Dosage { get; set; } 
    public string DosageUnit { get; set; } 
    
    public PrescriptionType PrescriptionType { get; set; } 
    
    public bool RequiresColdChain { get; set; } 
    public int ShelfLifeInMonths { get; set; } 
    public int UnitsPerBox { get; set; } 
    public int MinimumStockLevel { get; set; } 
}