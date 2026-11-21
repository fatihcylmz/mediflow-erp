using System;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Returns;

[Authorize]
public class ReturnAppService : CrudAppService<
    Return,
    ReturnDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateReturnDto>, IReturnAppService
{
    public ReturnAppService(IRepository<Return, Guid> repository) : base(repository)
    {
    }
}