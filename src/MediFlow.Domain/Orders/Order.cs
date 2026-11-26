using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Orders;

public class Order : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; }
    public Guid? CustomerId { get; set; } // Hasta/Müşteri bazlı sipariş takibi için
    public Guid? WarehouseId { get; set; } // Depo bazlı B2B tedarik zinciri muhatabı
    public string? WarehouseName { get; set; } // Depo adı (N+1 önleme)

    public string OrderNumber { get; set; } // Örn: "ORD-2026-001"
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }

    public string Notes { get; set; }
}