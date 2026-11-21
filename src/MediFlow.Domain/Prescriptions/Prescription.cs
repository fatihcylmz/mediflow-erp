using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Prescriptions;

public class Prescription : FullAuditedAggregateRoot<Guid>
{
    public Guid CustomerId { get; set; } // Hangi Hasta? (Daha önce açtığımız Customer tablosuna FK)
    
    public string EPrescriptionNumber { get; set; } // Örn: "RX-99887766" (Devletin verdiği e-reçete no)
    public string DoctorName { get; set; }
    public string DoctorDiplomaNumber { get; set; } // Kontrole tabi ilaçlar için doktorun yetki onayı
    public string HospitalName { get; set; }
    
    public DateTime IssueDate { get; set; } // Reçetenin yazıldığı tarih (Reçetelerin geçerlilik süresi vardır)
}