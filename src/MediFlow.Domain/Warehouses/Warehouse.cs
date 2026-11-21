using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Warehouses;

public class Warehouse : FullAuditedAggregateRoot<Guid>
{
    public string Name { get; set; } // Örn: "İstanbul Merkez Depo"
    public string LocationAddress { get; set; }
    public string ManagerName { get; set; }
    
    // Soğuk zincir ilaçlar (RequiresColdChain = true) sadece bu değeri true olan depolara girebilir.
    public bool HasColdStorage { get; set; } 
}