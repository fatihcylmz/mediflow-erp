using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Customers;

public class Customer : FullAuditedAggregateRoot<Guid>
{
    public string IdentityNumber { get; set; } // TCKN veya Pasaport (Reçeteli ilaç takibi için kritik)
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; } // Yaş kısıtlaması olan ilaçların kontrolü için
}