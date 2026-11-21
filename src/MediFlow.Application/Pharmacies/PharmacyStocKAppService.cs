using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Pharmacies;

public class PharmacyStockAppService :
    CrudAppService<
        PharmacyStock, // Entity
        PharmacyStockDto, // DTO
        Guid, // PK
        PagedAndSortedResultRequestDto, 
        CreateUpdatePharmacyStockDto>, 
    IPharmacyStockAppService
{
    public PharmacyStockAppService(IRepository<PharmacyStock, Guid> repository)
        : base(repository)
    {
    }
}