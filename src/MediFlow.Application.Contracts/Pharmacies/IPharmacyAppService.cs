using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Pharmacies;

public interface IPharmacyAppService : ICrudAppService<
    PharmacyDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdatePharmacyDto>
{
}