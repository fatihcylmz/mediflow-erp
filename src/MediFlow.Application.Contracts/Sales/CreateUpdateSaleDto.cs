using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Sales;

public class CreateUpdateSaleDto
{
    public Guid PharmacyId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? PrescriptionId { get; set; }
    public DateTime SaleDate { get; set; }

    [Range(0, 1000000)]
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Satış kalemleri (her biri bir StokBatch'ten düşülecektir)
    /// </summary>
    public List<CreateUpdateSaleItemDto>? Items { get; set; } = new();

    public Guid? InvoiceId { get; set; } // Faturayla ilişkilendirme
}
