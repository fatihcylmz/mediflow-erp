using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Pharmacies;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Pharmacies)]
public class PharmacyController : AbpController
{
    private readonly PharmacyAppService _pharmacyAppService;

    public PharmacyController(PharmacyAppService pharmacyAppService)
    {
        _pharmacyAppService = pharmacyAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.PharmaciesView)]
    public Task<PagedResultDto<PharmacyDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _pharmacyAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.PharmaciesView)]
    public Task<PharmacyDto> GetAsync(Guid id)
    {
        return _pharmacyAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.PharmaciesCreate)]
    public Task<PharmacyDto> CreateAsync([FromBody] CreateUpdatePharmacyDto input)
    {
        return _pharmacyAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.PharmaciesEdit)]
    public Task<PharmacyDto> UpdateAsync(Guid id, [FromBody] CreateUpdatePharmacyDto input)
    {
        return _pharmacyAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.PharmaciesDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _pharmacyAppService.DeleteAsync(id);
    }
}