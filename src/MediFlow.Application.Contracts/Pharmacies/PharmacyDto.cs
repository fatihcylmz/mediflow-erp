using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Pharmacies;

public class PharmacyDto : FullAuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string GLN { get; set; }
    public string TaxNumber { get; set; }
    public string PharmacistName { get; set; }
    public string PharmacistLicenseNumber { get; set; }
    public string Address { get; set; }
    public string PhoneNumber { get; set; }
}