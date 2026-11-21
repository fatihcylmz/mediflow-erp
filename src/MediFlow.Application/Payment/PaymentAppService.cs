using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using MediFlow.Payment;
using MediFlow.Application.Contracts.Payment;

namespace MediFlow.Application.Payment;

public class PaymentAppService : ApplicationService, IPaymentAppService
{
    private readonly IRepository<PaymentMethod, Guid> _paymentMethodRepository;
    private readonly IRepository<PaymentTransaction, Guid> _paymentTransactionRepository;

    public PaymentAppService(
        IRepository<PaymentMethod, Guid> paymentMethodRepository,
        IRepository<PaymentTransaction, Guid> paymentTransactionRepository)
    {
        _paymentMethodRepository = paymentMethodRepository;
        _paymentTransactionRepository = paymentTransactionRepository;
    }

    // CRUD Operations
    public async Task<PaymentMethodDto> CreateAsync(CreateUpdatePaymentMethodDto input)
    {
        var paymentMethod = new PaymentMethod
        {
            Name = input.Name,
            Code = input.Code,
            Description = input.Description,
            IsActive = input.IsActive,
            RequiresApproval = input.RequiresApproval,
            FeePercentage = input.FeePercentage
        };

        var inserted = await _paymentMethodRepository.InsertAsync(paymentMethod);
        return ObjectMapper.Map<PaymentMethod, PaymentMethodDto>(inserted);
    }

    public async Task<PaymentMethodDto> UpdateAsync(Guid id, CreateUpdatePaymentMethodDto input)
    {
        var paymentMethod = await _paymentMethodRepository.GetAsync(id);
        paymentMethod.Name = input.Name;
        paymentMethod.Code = input.Code;
        paymentMethod.Description = input.Description;
        paymentMethod.IsActive = input.IsActive;
        paymentMethod.RequiresApproval = input.RequiresApproval;
        paymentMethod.FeePercentage = input.FeePercentage;

        var updated = await _paymentMethodRepository.UpdateAsync(paymentMethod);
        return ObjectMapper.Map<PaymentMethod, PaymentMethodDto>(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _paymentMethodRepository.DeleteAsync(id);
    }

    public async Task<PaymentMethodDto> GetAsync(Guid id)
    {
        var paymentMethod = await _paymentMethodRepository.GetAsync(id);
        return ObjectMapper.Map<PaymentMethod, PaymentMethodDto>(paymentMethod);
    }

    public async Task<List<PaymentMethodDto>> GetListAsync()
    {
        var paymentMethods = await _paymentMethodRepository.GetListAsync();
        return ObjectMapper.Map<List<PaymentMethod>, List<PaymentMethodDto>>(paymentMethods);
    }
}