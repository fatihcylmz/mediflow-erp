using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using MediFlow.Services;

namespace MediFlow.Pharmacies;

public class PharmacyStockAppService :
    CrudAppService<
        PharmacyStock, // Entity
        PharmacyStockDto, // DTO
        Guid, // PK
        PagedAndSortedResultRequestDto,
        CreateUpdatePharmacyStockDto>,
    IPharmacyStockAppService
{
    private readonly UserScopeService _userScopeService;

    public PharmacyStockAppService(
        IRepository<PharmacyStock, Guid> repository,
        UserScopeService userScopeService)
        : base(repository)
    {
        _userScopeService = userScopeService;
    }

    // Eczane kapsamı: PharmacyAdmin/Sales yalnızca kendi eczanesinin raf envanterini görür.
    public override async Task<PagedResultDto<PharmacyStockDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();

        if (!pharmacyScope.HasValue)
        {
            return await base.GetListAsync(input);
        }

        // Fail-closed: Guid.Empty kapsamda hiçbir sonuç döndürülmez
        var all = await Repository.GetListAsync(s => s.PharmacyId == pharmacyScope.Value);

        var paged = all
            .OrderByDescending(s => s.CreationTime)
            .Skip(input.SkipCount)
            .Take(input.MaxResultCount)
            .ToList();

        var dtos = new List<PharmacyStockDto>();
        foreach (var stock in paged)
        {
            dtos.Add(ObjectMapper.Map<PharmacyStock, PharmacyStockDto>(stock));
        }

        return new PagedResultDto<PharmacyStockDto>(all.Count, dtos);
    }

    public override async Task<PharmacyStockDto> GetAsync(Guid id)
    {
        var dto = await base.GetAsync(id);

        var pharmacyScope = await _userScopeService.GetPharmacyScopeAsync();
        if (pharmacyScope.HasValue && dto.PharmacyId != pharmacyScope.Value)
        {
            throw new UserFriendlyException("Bu envanter kaydına erişme yetkiniz bulunmuyor.");
        }

        return dto;
    }
}
