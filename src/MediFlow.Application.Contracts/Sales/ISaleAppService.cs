using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Sales;

public interface ISaleAppService : ICrudAppService<
    SaleDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdateSaleDto>
{
    Task CancelSaleAsync(Guid saleId);
}