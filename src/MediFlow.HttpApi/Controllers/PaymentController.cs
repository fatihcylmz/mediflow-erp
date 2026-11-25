using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;
using MediFlow.Application.Contracts.Payment;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/payment-transaction")]
[Authorize(MediFlowPermissions.Payments)]
public class PaymentTransactionController : AbpController
{
    private readonly IPaymentAppService _paymentAppService;

    public PaymentTransactionController(IPaymentAppService paymentAppService)
    {
        _paymentAppService = paymentAppService;
    }

    [HttpGet]
    [Authorize(MediFlowPermissions.PaymentsView)]
    public Task<List<PaymentTransactionDto>> GetTransactionsAsync()
    {
        return _paymentAppService.GetPaymentTransactionListAsync();
    }

    [HttpGet("{id}")]
    [Authorize(MediFlowPermissions.PaymentsView)]
    public Task<PaymentTransactionDto> GetTransactionAsync(Guid id)
    {
        return _paymentAppService.GetPaymentTransactionAsync(id);
    }

    [HttpPost]
    [Authorize(MediFlowPermissions.PaymentsCreate)]
    public Task<PaymentTransactionDto> CreateTransactionAsync([FromBody] CreateUpdatePaymentTransactionDto input)
    {
        return _paymentAppService.CreatePaymentTransactionAsync(input);
    }

    [HttpPut("{id}")]
    [Authorize(MediFlowPermissions.PaymentsEdit)]
    public Task<PaymentTransactionDto> UpdateTransactionAsync(Guid id, [FromBody] CreateUpdatePaymentTransactionDto input)
    {
        return _paymentAppService.UpdatePaymentTransactionAsync(id, input);
    }

    [HttpDelete("{id}")]
    [Authorize(MediFlowPermissions.PaymentsDelete)]
    public Task DeleteTransactionAsync(Guid id)
    {
        return _paymentAppService.DeletePaymentTransactionAsync(id);
    }
}