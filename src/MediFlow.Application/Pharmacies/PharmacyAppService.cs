using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Pharmacies;

public class PharmacyAppService : CrudAppService<
    Pharmacy, 
    PharmacyDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdatePharmacyDto>, IPharmacyAppService
{
    public PharmacyAppService(IRepository<Pharmacy, Guid> repository) : base(repository)
    {
    }
}