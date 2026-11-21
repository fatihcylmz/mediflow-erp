using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Drugs;

public interface IDrugAppService : ICrudAppService<DrugDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateDrugDto>
{
}