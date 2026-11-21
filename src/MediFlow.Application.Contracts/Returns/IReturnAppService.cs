using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Returns;

public interface IReturnAppService : ICrudAppService<
    ReturnDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdateReturnDto>
{
}