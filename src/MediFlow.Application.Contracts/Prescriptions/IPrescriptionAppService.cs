using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Prescriptions;

public interface IPrescriptionAppService : ICrudAppService<
    PrescriptionDto, 
    Guid, 
    PagedAndSortedResultRequestDto, 
    CreateUpdatePrescriptionDto>
{
}