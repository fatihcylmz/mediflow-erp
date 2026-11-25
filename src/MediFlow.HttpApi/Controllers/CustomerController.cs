using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Customers;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize(MediFlowPermissions.Customers)]
public class CustomerController : AbpController
{
    private readonly CustomerAppService _customerAppService;

    public CustomerController(CustomerAppService customerAppService)
    {
        _customerAppService = customerAppService;
    }

    [HttpGet("{id}")]
    public async Task<CustomerDto> GetAsync(Guid id)
    {
        return await _customerAppService.GetAsync(id);
    }

    [HttpGet]
    public async Task<PagedResultDto<CustomerDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _customerAppService.GetListAsync(input);
    }

    [HttpPost]
    public async Task<CustomerDto> CreateAsync(CreateUpdateCustomerDto input)
    {
        return await _customerAppService.CreateAsync(input);
    }

    [HttpPut]
    public async Task<CustomerDto> UpdateAsync(Guid id, CreateUpdateCustomerDto input)
    {
        return await _customerAppService.UpdateAsync(id, input);
    }

    [HttpDelete]
    public async Task DeleteAsync(Guid id)
    {
        await _customerAppService.DeleteAsync(id);
    }
}