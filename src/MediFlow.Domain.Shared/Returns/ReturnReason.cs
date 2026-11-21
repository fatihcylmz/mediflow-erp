namespace MediFlow.Returns;

public enum ReturnReason
{
    Expired = 0,       // Son kullanma tarihi geçmiş
    Damaged = 1,       // Kutusu/Ambalajı hasarlı
    Recall = 2,        // Sağlık Bakanlığı toplatma kararı (Karantina)
    WrongItem = 3      // Yanlış ürün gönderimi
}