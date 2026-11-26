using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Pharmacies;
using MediFlow.Services;

namespace MediFlow.Prescriptions;

public class PrescriptionAppService : CrudAppService<
    Prescription,
    PrescriptionDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreateUpdatePrescriptionDto>, IPrescriptionAppService
{
    private readonly IRepository<Pharmacy, Guid> _pharmacyRepository;
    private readonly UserScopeService _userScopeService;

    public PrescriptionAppService(
        IRepository<Prescription, Guid> repository,
        IRepository<Pharmacy, Guid> pharmacyRepository,
        UserScopeService userScopeService) : base(repository)
    {
        _pharmacyRepository = pharmacyRepository;
        _userScopeService = userScopeService;
    }

    // Eczane kapsamı: PharmacyAdmin/Sales yalnızca kendi eczanesinin reçetelerini görür.
    public override async Task<PagedResultDto<PrescriptionDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();

        if (!pharmacyScope.HasValue)
        {
            return await base.GetListAsync(input);
        }

        // Fail-closed: Guid.Empty kapsamda hiçbir sonuç döndürülmez
        var all = await Repository.GetListAsync(p => p.PharmacyId == pharmacyScope.Value);

        var paged = all
            .OrderByDescending(p => p.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = new List<PrescriptionDto>();
        foreach (var prescription in paged)
        {
            var dto = ObjectMapper.Map<Prescription, PrescriptionDto>(prescription);
            await FillPharmacyNameAsync(dto);
            dtos.Add(dto);
        }

        return new PagedResultDto<PrescriptionDto>(all.Count, dtos);
    }

    public override async Task<PrescriptionDto> GetAsync(Guid id)
    {
        var dto = await base.GetAsync(id);

        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();
        if (pharmacyScope.HasValue && dto.PharmacyId != pharmacyScope.Value)
        {
            throw new UserFriendlyException("Bu reçeteye erişme yetkiniz bulunmuyor.");
        }

        await FillPharmacyNameAsync(dto);
        return dto;
    }

    public override async Task<PrescriptionDto> CreateAsync(CreateUpdatePrescriptionDto input)
    {
        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();

        // Eczane rolleri yalnızca kendi eczanesi için reçete oluşturabilir
        if (pharmacyScope.HasValue)
        {
            input.PharmacyId = pharmacyScope.Value;
        }

        var result = await base.CreateAsync(input);
        await FillPharmacyNameAsync(result);
        return result;
    }

    public override async Task<PrescriptionDto> UpdateAsync(Guid id, CreateUpdatePrescriptionDto input)
    {
        // Kapsam kontrolü GetAsync üzerinden geçer
        var existing = await GetAsync(id);

        // Eczane rolü reçeteyi başka eczaneye taşıyamaz
        input.PharmacyId = existing.PharmacyId;

        var result = await base.UpdateAsync(id, input);
        await FillPharmacyNameAsync(result);
        return result;
    }

    public override async Task DeleteAsync(Guid id)
    {
        // Kapsam dışı reçete silinemez
        await GetAsync(id);
        await base.DeleteAsync(id);
    }

    private async Task FillPharmacyNameAsync(PrescriptionDto dto)
    {
        if (dto?.PharmacyId.HasValue == true)
        {
            var pharmacy = await _pharmacyRepository.FirstOrDefaultAsync(p => p.Id == dto.PharmacyId.Value);
            dto.PharmacyName = pharmacy?.Name;
        }
    }
}
