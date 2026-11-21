using System;
using Volo.Abp.Identity;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Users;

public class MediFlowUser : IdentityUser
{
    // Eklemek istediğimiz özel alanlar
    public string? Address { get; set; }

    public MediFlowUser(
        Guid id,
        string userName,
        string email,
        Guid? tenantId = null)
        : base(id, userName, email, tenantId)
    {
    }
}