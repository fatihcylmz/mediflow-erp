using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Returns;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Returns)]
public class ReturnController : AbpController
{
    private readonly ReturnAppService _returnAppService;

    public ReturnController(ReturnAppService returnAppService)
    {
        _returnAppService = returnAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.ReturnsView)]
    public Task<PagedResultDto<ReturnDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _returnAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.ReturnsView)]
    public Task<ReturnDto> GetAsync(Guid id)
    {
        return _returnAppService.GetAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.ReturnsCreate)]
    public Task<ReturnDto> CreateAsync([FromBody] CreateUpdateReturnDto input)
    {
        return _returnAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.ReturnsEdit)]
    public Task<ReturnDto> UpdateAsync(Guid id, [FromBody] CreateUpdateReturnDto input)
    {
        return _returnAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.ReturnsDelete)]
    public Task DeleteAsync(Guid id)
    {
        return _returnAppService.DeleteAsync(id);
    }
}