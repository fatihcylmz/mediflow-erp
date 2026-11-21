using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Customers;

public class CustomerDto : FullAuditedEntityDto<Guid>
{
    public string IdentityNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
}