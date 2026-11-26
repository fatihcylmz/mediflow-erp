using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Shipments;

public class Shipment : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; } // Hangi Eczaneye gidiyor?
    public Guid? WarehouseId { get; set; } // Depo bazlı B2B tedarik zinciri muhatabı
    public string? WarehouseName { get; set; } // Depo adı (N+1 önleme)
    public Guid? OrderId { get; set; }
    public string TrackingNumber { get; set; } // Kargo/Araç takip numarası
    public DateTime ShipmentDate { get; set; }
    public ShipmentStatus Status { get; set; }

    // Eczacı ilacı teslim aldığında kendi İTS sisteminden onay vereceği için:
    public DateTime? DeliveryDate { get; set; }
}