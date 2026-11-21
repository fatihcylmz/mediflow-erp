using System;
using Volo.Abp.Domain.Entities.Auditing;    

namespace MediFlow.Suppliers;

  public class Supplier: FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; }
    public string TaxNumber  { get; set; }
    public string ContactName { get; set; }
    public string ContactSurname { get; set; }
    public string PhoneNumber   { get; set; }
    public string Email    { get; set; }

}