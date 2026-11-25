using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Invoices;

public class CreateUpdateInvoiceDto
{
    public Guid PharmacyId { get; set; }
    public Guid ShipmentId { get; set; }

    [Required]
    [StringLength(64)]
    public string InvoiceNumber { get; set; }

    public DateTime IssuedDate { get; set; }
    public DateTime DueDate { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }

    // Varsayılan olarak Draft (Taslak) durumunda başlasın
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    // Fatura kalemleri (backend otomatik doldurur, frontend'den de gönderilebilir)
    public List<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
}