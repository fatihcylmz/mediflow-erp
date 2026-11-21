using System;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Drugs;

[Authorize]
public class DrugAppService : CrudAppService<
    Drug,
    DrugDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateDrugDto>, IDrugAppService
{
    public DrugAppService(IRepository<Drug, Guid> repository) : base(repository)
    {
    }
}