using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Returns;

public interface IReturnItemAppService :
    ICrudAppService<
        ReturnItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReturnItemDto>
{
}