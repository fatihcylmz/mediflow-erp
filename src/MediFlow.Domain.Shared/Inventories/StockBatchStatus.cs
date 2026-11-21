namespace MediFlow.Inventories;

public enum StockBatchStatus
{
    Active = 0,        // Aktif satışı ve sevkiyatı devam ediyor
    Quarantine = 1,    // Karantinada (Kalite testi beklemede / Kontrolde)
    Expired = 2,       // SKT'si (Son Kullanma Tarihi) geçmiş
    Recalled = 3       // Üretici tarafından geri çekildi (Geri Çağırma)
}