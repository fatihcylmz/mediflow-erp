using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Orders;

public class OrderDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public string? PharmacyName { get; set; } // [D5] Join ile doldurulur, N+1 önlenir
    public Guid? WarehouseId { get; set; } // Depo bazlı B2B tedarik zinciri muhatabı
    public string? WarehouseName { get; set; } // Depo adı (N+1 önleme)
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; } // [D5] Tanı / TC kimlik no
    public string OrderNumber { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
    public string Notes { get; set; }
}