using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Returns;

public class ReturnItemAppService :
    CrudAppService<
        ReturnItem,
        ReturnItemDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateReturnItemDto>,
    IReturnItemAppService
{
    public ReturnItemAppService(IRepository<ReturnItem, Guid> repository)
        : base(repository)
    {
    }
}