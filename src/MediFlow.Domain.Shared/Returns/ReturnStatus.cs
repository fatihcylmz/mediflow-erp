namespace MediFlow.Returns;

public enum ReturnStatus
{
    InReview = 0,    // İncelemede / Depo Kabul Bekliyor
    Approved = 1,    // Onaylandı & Stoğa Alındı
    Rejected = 2,    // İade Reddedildi
    Quarantine = 3   // Karantinaya Alındı / İmha
}