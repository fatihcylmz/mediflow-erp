using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using MediFlow.Application.Contracts.Payment;

namespace MediFlow.Application.Contracts.Payment;

public interface IPaymentAppService : IApplicationService
{
    Task<PaymentMethodDto> CreateAsync(CreateUpdatePaymentMethodDto input);
    Task<PaymentMethodDto> UpdateAsync(Guid id, CreateUpdatePaymentMethodDto input);
    Task DeleteAsync(Guid id);
    Task<PaymentMethodDto> GetAsync(Guid id);
    Task<List<PaymentMethodDto>> GetListAsync();
}