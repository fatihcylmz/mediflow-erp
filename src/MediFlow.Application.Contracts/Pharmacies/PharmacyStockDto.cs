using System;
using Volo.Abp.Application.Dtos;

namespace MediFlow.Pharmacies;

// FullAuditedEntityDto'dan miras alıyoruz ki tüm log/tarih verilerini dışarı aktarabilelim
public class PharmacyStockDto : FullAuditedEntityDto<Guid>
{
    public Guid PharmacyId { get; set; }
    public Guid DrugId { get; set; }
    public string LotNumber { get; set; }
    public DateTime ExpirationDate { get; set; }
    public int Quantity { get; set; }
}