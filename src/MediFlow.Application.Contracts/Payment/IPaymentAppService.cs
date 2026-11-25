using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using MediFlow.Application.Contracts.Payment;

namespace MediFlow.Application.Contracts.Payment;

public interface IPaymentAppService : IApplicationService
{
    // PaymentMethod CRUD
    Task<PaymentMethodDto> CreateAsync(CreateUpdatePaymentMethodDto input);
    Task<PaymentMethodDto> UpdateAsync(Guid id, CreateUpdatePaymentMethodDto input);
    Task DeleteAsync(Guid id);
    Task<PaymentMethodDto> GetAsync(Guid id);
    Task<List<PaymentMethodDto>> GetListAsync();

    // PaymentTransaction CRUD
    Task<PaymentTransactionDto> CreatePaymentTransactionAsync(CreateUpdatePaymentTransactionDto input);
    Task<PaymentTransactionDto> UpdatePaymentTransactionAsync(Guid id, CreateUpdatePaymentTransactionDto input);
    Task DeletePaymentTransactionAsync(Guid id);
    Task<PaymentTransactionDto> GetPaymentTransactionAsync(Guid id);
    Task<List<PaymentTransactionDto>> GetPaymentTransactionListAsync();
}