using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Application.Contracts.Payment;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/payment-method")]
public class PaymentMethodController : AbpController
{
    private readonly IPaymentAppService _paymentAppService;

    public PaymentMethodController(IPaymentAppService paymentAppService)
    {
        _paymentAppService = paymentAppService;
    }

    [HttpGet]
    public Task<List<PaymentMethodDto>> GetMethodsAsync()
    {
        return _paymentAppService.GetListAsync();
    }

    [HttpPost]
    public Task<PaymentMethodDto> CreateMethodAsync([FromBody] CreateUpdatePaymentMethodDto input)
    {
        return _paymentAppService.CreateAsync(input);
    }

    [HttpPut("{id}")]
    public Task<PaymentMethodDto> UpdateMethodAsync(Guid id, [FromBody] CreateUpdatePaymentMethodDto input)
    {
        return _paymentAppService.UpdateAsync(id, input);
    }

    [HttpDelete("{id}")]
    public Task DeleteMethodAsync(Guid id)
    {
        return _paymentAppService.DeleteAsync(id);
    }
}
