namespace MediFlow.Inventories;

public enum StockMovementType
{
    Entry = 0,         // Üreticiden depoya ilk giriş (+)
    Dispatch = 1,      // Depodan eczaneye çıkış (-)
    ReturnIn = 2,      // Eczaneden depoya iade girişi (+)
    Scrap = 3,         // Kırılma, bozulma, imha etme (-)
    Adjustment = 4     // Sayım farkı düzeltmesi (+/-)
}