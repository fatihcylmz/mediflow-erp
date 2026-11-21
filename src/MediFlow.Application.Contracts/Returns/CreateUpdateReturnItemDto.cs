using System;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Returns;

public class CreateUpdateReturnItemDto
{
    [Required]
    public Guid ReturnId { get; set; }

    public Guid? StockBatchId { get; set; } // Eski yapıyla uyum için opsiyonel bırakıldı

    [Required]
    public Guid DrugId { get; set; } // YENİ: Faturadaki ilacın kimliği (Adet/Stok takibi için zorunlu)

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Miktar en az 1 olmalıdır.")]
    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; } // YENİ: Faturadaki net birim fiyatı

    public decimal TaxRate { get; set; } = 8; // YENİ: KDV Oranı (%8 varsayılan)

    public decimal LineTotal { get; set; } // YENİ: Alacak tutarı (Miktar * Birim Fiyat * KDV)

    [Required]
    public ReturnReason Reason { get; set; }
}