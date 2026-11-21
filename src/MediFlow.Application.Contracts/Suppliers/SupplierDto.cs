using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Suppliers;

public class SupplierDto : AuditedEntityDto<Guid>
{
    public string Name { get; set; }
    public string TaxNumber { get; set; }
    public string ContactName { get; set; }
    public string ContactSurname { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
}