using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Pricing;

public interface IDrugPriceHistoryAppService : ICrudAppService<DrugPriceHistoryDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateDrugPriceHistoryDto>
{
}