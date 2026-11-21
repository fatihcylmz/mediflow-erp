namespace MediFlow.Shipments;

public enum ShipmentStatus
{
    Preparing = 0,    // Depoda toplanıyor
    Dispatched = 1,   // Yola çıktı
    Delivered = 2,    // Eczaneye teslim edildi
    Cancelled = 3     // İptal edildi
}