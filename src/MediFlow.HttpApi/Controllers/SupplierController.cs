using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Suppliers;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Suppliers)]
public class SupplierController : AbpController
{
    private readonly SupplierAppService _supplierAppService;

    public SupplierController(SupplierAppService supplierAppService)
    {
        _supplierAppService = supplierAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.SuppliersView)]
    public Task<PagedResultDto<SupplierDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _supplierAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.SuppliersView)]
    public Task<SupplierDto> GetAsync(Guid id)
    {
        return _supplierAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.SuppliersCreate)]
    public Task<SupplierDto> CreateAsync([FromBody] CreateUpdateSupplierDto input)
    {
        return _supplierAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.SuppliersEdit)]
    public Task<SupplierDto> UpdateAsync(Guid id, [FromBody] CreateUpdateSupplierDto input)
    {
        return _supplierAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.SuppliersDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _supplierAppService.DeleteAsync(id);
    }
}
