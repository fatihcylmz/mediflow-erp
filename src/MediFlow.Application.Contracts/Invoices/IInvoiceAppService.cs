using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Invoices;

public interface IInvoiceAppService : ICrudAppService<InvoiceDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateInvoiceDto>
{
    /// <summary>
    /// Faturayı iptal eder. Ödenmiş faturalar bu şekilde iptal edilemez, kredi notu süreci izlenmelidir.
    /// </summary>
    Task CancelInvoiceAsync(Guid invoiceId);
}
