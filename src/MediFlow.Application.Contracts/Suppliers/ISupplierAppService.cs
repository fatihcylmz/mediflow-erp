using System;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Suppliers;

public interface ISupplierAppService :
    ICrudAppService<
        SupplierDto, // Listeleme ve gösterme için
        Guid, // Anahtar tipimiz (Id)
        PagedAndSortedResultRequestDto, // Sayfalama ve sıralama için standart DTO
        CreateUpdateSupplierDto> // Ekleme ve Güncelleme için
{
}