using System;
using Volo.Abp.Application.Dtos;
using System.Collections.Generic;

namespace MediFlow.Invoices;

public class InvoiceDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public string? PharmacyName { get; set; } // [D5] N+1 önleme
    public Guid? WarehouseId { get; set; } // Depo bazlı B2B tedarik zinciri muhatabı
    public string? WarehouseName { get; set; } // Depo adı (N+1 önleme)
    public Guid ShipmentId { get; set; }
    public string? ShipmentTrackingNumber { get; set; } // [D5]
    public string InvoiceNumber { get; set; }
    public DateTime IssuedDate { get; set; }
    public DateTime DueDate { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public InvoiceStatus Status { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
}