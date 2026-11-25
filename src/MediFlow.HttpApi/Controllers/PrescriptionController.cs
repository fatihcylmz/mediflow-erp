using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Prescriptions;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Prescriptions)]
public class PrescriptionController : AbpController
{
    private readonly IPrescriptionAppService _prescriptionAppService;

    public PrescriptionController(IPrescriptionAppService prescriptionAppService)
    {
        _prescriptionAppService = prescriptionAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.PrescriptionsView)]
    public Task<PagedResultDto<PrescriptionDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _prescriptionAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.PrescriptionsView)]
    public Task<PrescriptionDto> GetAsync(Guid id)
    {
        return _prescriptionAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.PrescriptionsCreate)]
    public Task<PrescriptionDto> CreateAsync([FromBody] CreateUpdatePrescriptionDto input)
    {
        return _prescriptionAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.PrescriptionsEdit)]
    public Task<PrescriptionDto> UpdateAsync(Guid id, [FromBody] CreateUpdatePrescriptionDto input)
    {
        return _prescriptionAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.PrescriptionsDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _prescriptionAppService.DeleteAsync(id);
    }
}