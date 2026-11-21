using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Pharmacies;

public interface IPharmacyStockAppService :
    ICrudAppService<
        PharmacyStockDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdatePharmacyStockDto>
{
}