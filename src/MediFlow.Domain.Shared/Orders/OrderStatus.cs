namespace MediFlow.Orders;

public enum OrderStatus
{
    Pending = 0,       // Eczane siparişi geçti, onay bekliyor
    Approved = 1,      // Depo onayladı, toplanmaya başlanacak
    Fulfilled = 2,     // Sevkiyata (Shipment) dönüştü ve tamamlandı
    Cancelled = 3
}