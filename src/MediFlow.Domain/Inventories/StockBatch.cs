    using System;
    using Volo.Abp.Domain.Entities.Auditing;

    namespace MediFlow.Inventories;

    public class StockBatch : FullAuditedAggregateRoot<Guid>
    {
        public Guid DrugId { get; set; } // Hangi İlaç? (ID ile referans)
        public Guid WarehouseId { get; set; } // Hangi Depoda? (ID ile referans)
        public Guid SupplierId { get; set; } // Artık null olamaz, zorunlu alan!

        public required string LotNumber { get; set; } // Üretim Parti Numarası (Örn: "LOT-2026-A45")
        public DateTime ExpirationDate { get; set; } // Son Kullanma Tarihi (SKT)
        
        public int Quantity { get; set; } // Bu partiden/lottan depoda kaç kutu kaldı?
        public int ReservedQuantity { get; set; } // Bu partiden/lottan kaç kutu siparişlerde rezerve edildi? (Örn: 10 kutu siparişlerde bekliyor, 40 kutu depoda mevcut, toplam 50 kutu)

        public  required string ShelfLocation { get; set; } // Örn: "Koridor-A / Raf-3 / Kutu-12" 5")
        public bool IsQuarantined { get; set; }  //Toplatma veya hasar durumunda bu parti satılamaz hale gelir.
    }
