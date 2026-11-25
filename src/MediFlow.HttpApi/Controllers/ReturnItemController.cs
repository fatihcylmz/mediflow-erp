using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Returns;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/return-item")]
public class ReturnItemController : AbpController
{
    private readonly IReturnItemAppService _returnItemAppService;

    public ReturnItemController(IReturnItemAppService returnItemAppService)
    {
        _returnItemAppService = returnItemAppService;
    }

    [HttpGet]
    public Task<PagedResultDto<ReturnItemDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return _returnItemAppService.GetListAsync(input);
    }

    [HttpGet("{id}")]
    public Task<ReturnItemDto> GetAsync(Guid id)
    {
        return _returnItemAppService.GetAsync(id);
    }

    [HttpPost]
    public Task<ReturnItemDto> CreateAsync([FromBody] CreateUpdateReturnItemDto input)
    {
        return _returnItemAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<ReturnItemDto> UpdateAsync(Guid id, [FromBody] CreateUpdateReturnItemDto input)
    {
        return _returnItemAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteAsync(Guid id)
    {
        return _returnItemAppService.DeleteAsync(id);
    }
}
