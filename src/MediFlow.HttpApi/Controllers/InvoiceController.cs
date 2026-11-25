using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Invoices;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Invoices)]
public class InvoiceController : AbpController
{
    private readonly InvoiceAppService _invoiceAppService;

    public InvoiceController(InvoiceAppService invoiceAppService)
    {
        _invoiceAppService = invoiceAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.InvoicesView)]
    public Task<PagedResultDto<InvoiceDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _invoiceAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.InvoicesView)]
    public Task<InvoiceDto> GetAsync(Guid id)
    {
        return _invoiceAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.InvoicesCreate)]
    public Task<InvoiceDto> CreateAsync([FromBody] CreateUpdateInvoiceDto input)
    {
        return _invoiceAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.InvoicesEdit)]
    public Task<InvoiceDto> UpdateAsync(Guid id, [FromBody] CreateUpdateInvoiceDto input)
    {
        return _invoiceAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.InvoicesDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _invoiceAppService.DeleteAsync(id);
    }

    [HttpPost("{id}/cancel")]
    [Authorize(MediFlowPermissions.InvoicesCancel)]
    public Task CancelInvoiceAsync(Guid id)
    {
        return _invoiceAppService.CancelInvoiceAsync(id);
    }
}