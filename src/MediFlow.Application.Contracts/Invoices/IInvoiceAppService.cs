using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Invoices;

public interface IInvoiceAppService : ICrudAppService<InvoiceDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateInvoiceDto>
{
}