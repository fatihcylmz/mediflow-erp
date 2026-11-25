namespace MediFlow.Inventories;

public enum StockMovementType
{
    Entry = 0,         // Üreticiden depoya ilk giriş (+)
    Dispatch = 1,      // Depodan eczaneye çıkış (-)
    ReturnIn = 2,      // Eczaneden depoya iade girişi (+)
    Scrap = 3,         // Kırılma, bozulma, imha etme (-)
    Adjustment = 4     // Sayım farkı düzeltmesi (+/-)
}

/// <summary>
/// StockMovementLog.ReferenceId'in hangientity'e ait olduğunu belirtir.
/// </summary>
public enum StockMovementReferenceType
{
    Unknown = 0,
    Order = 1,         // Sipariş kalemi
    Shipment = 2,      // Sevkiyat kalemi
    Invoice = 3,       // Fatura kalemi
    Sale = 4,          // Satış kalemi
    Return = 5,        // İade kalemi
    Purchase = 6       // Satın alma (sipariş onayı sonrası stok girişi)
}