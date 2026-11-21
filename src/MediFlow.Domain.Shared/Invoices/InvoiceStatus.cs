namespace MediFlow.Invoices;

public enum InvoiceStatus
{
    Draft = 0,
    Issued = 1,        // Fatura kesildi, eczaneye iletildi
    Paid = 2,          // Ödeme alındı
    Overdue = 3,       // Vadesi geçti (Ödeme gecikti)
    Cancelled = 4
}