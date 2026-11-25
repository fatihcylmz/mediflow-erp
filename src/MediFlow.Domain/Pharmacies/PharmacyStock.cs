using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;

namespace MediFlow.Pharmacies;

public class PharmacyStock : FullAuditedAggregateRoot<Guid>
{
    public Guid PharmacyId { get; set; } // Hangi eczanenin rafında?
    public Guid DrugId { get; set; }     // Hangi ilaç?

    // İzlenebilirlik (İTS) bozulmasın diye Lot numarasını eczane rafına kadar taşıyoruz
    public string LotNumber { get; set; }
    public DateTime ExpirationDate { get; set; }

    public int Quantity { get; set; } // Eczanenin kendi dükkanındaki güncel miktar

    // Optimistic concurrency: aynı anda iki satış yapılınca lost update önlenir
    [ConcurrencyCheck]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}