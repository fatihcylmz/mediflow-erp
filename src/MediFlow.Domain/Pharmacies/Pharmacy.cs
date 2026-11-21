using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Pharmacies;

public class Pharmacy : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } 
    public string GLN { get; set; } // Global Location Number (Evrensel Eczane Barkodu)
    public string TaxNumber { get; set; }
    
    // Sorumlu Eczacı Bilgileri
    public string PharmacistName { get; set; }
    public string PharmacistLicenseNumber { get; set; } // Kırmızı/Yeşil reçete yetki kontrolü için kritik
    
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
}