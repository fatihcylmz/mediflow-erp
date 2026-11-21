using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Pricing;

public class DrugPriceHistoryAppService : CrudAppService<
    DrugPriceHistory, 
    DrugPriceHistoryDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdateDrugPriceHistoryDto>, IDrugPriceHistoryAppService
{
    public DrugPriceHistoryAppService(IRepository<DrugPriceHistory, Guid> repository) : base(repository)
    {
    }
}