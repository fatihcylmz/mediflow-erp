using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MediFlow.Orders;

public class CreateUpdateOrderDto
{
    public Guid PharmacyId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? WarehouseId { get; set; } // Depo bazlı B2B tedarik zinciri muhatabı

    [Required]
    [StringLength(50)]
    public string OrderNumber { get; set; }

    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string Notes { get; set; }

    /// <summary>
    /// Siparişe eşlik edecek ürün kalemleri. Boş ise sistem otomatik boş sipariş oluşturur.
    /// </summary>
    public List<CreateUpdateOrderItemDto>? Items { get; set; }
}