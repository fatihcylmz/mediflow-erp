using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Sales;

public class SaleItem : CreationAuditedEntity<Guid>
{
    public Guid SaleId { get; set; }
    
    // Eczacı karekodu okuttuğunda, bu ilacın aslında bizim depomuzdan çıkan hangi parti (Lot) olduğunu eşleştiririz.
    // Böylece "Üretici -> Depo -> Eczane -> Hasta" izlenebilirliği %100 sağlanmış olur.
    public Guid StockBatchId { get; set; } 
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } // O anki satış fiyatı
}