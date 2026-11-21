using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace MediFlow.Drugs;

public class DrugIngredientAppService :
    CrudAppService<
        DrugIngredient, // Gelen Entity
        DrugIngredientDto, // Dışarı Çıkan DTO
        Guid, // Primary Key tipi
        PagedAndSortedResultRequestDto, // Sayfalama ve Sıralama
        CreateUpdateDrugIngredientDto>, // Ekleme/Güncelleme DTO'su
    IDrugIngredientAppService
{
    public DrugIngredientAppService(IRepository<DrugIngredient, Guid> repository)
        : base(repository)
    {
    }
}