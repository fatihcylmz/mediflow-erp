using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using MediFlow.Pricing;

namespace MediFlow.Services;

public class PriceValidationService : DomainService
{
    private readonly IRepository<DrugPriceHistory, Guid> _priceHistoryRepository;

    public PriceValidationService(IRepository<DrugPriceHistory, Guid> priceHistoryRepository)
    {
        _priceHistoryRepository = priceHistoryRepository;
    }

    /// <summary>
    /// Belirli bir tarihte ilaç için geçerli olan resmi fiyatı getirir.
    /// </summary>
    public async Task<DrugPriceHistory?> GetValidPriceAsync(Guid drugId, DateTime date)
    {
        var prices = await _priceHistoryRepository.GetListAsync(p =>
            p.DrugId == drugId &&
            p.ValidFrom <= date &&
            (p.ValidTo == null || p.ValidTo >= date));

        return prices
            .OrderByDescending(p => p.ValidFrom)
            .FirstOrDefault();
    }

    /// <summary>
    /// Satış/İade fiyatının resmi fiyatla tutarlı olup olmadığını kontrol eder.
    /// Tolerans: %1 (yuvarlama farkları için)
    /// </summary>
    public async Task<PriceValidationResult> ValidatePriceAsync(Guid drugId, DateTime transactionDate, decimal unitPrice, decimal? taxRate = null)
    {
        var validPrice = await GetValidPriceAsync(drugId, transactionDate);

        if (validPrice == null)
        {
            return new PriceValidationResult
            {
                IsValid = true, // Fiyat geçmişi yoksa kontrol yapma (backward compatibility)
                Message = "İlaç için fiyat geçmişi bulunamadı, kontrol atlandı.",
                OfficialPrice = null,
                OfficialTaxRate = null
            };
        }

        var tolerance = validPrice.Price * 0.01m; // %1 tolerans
        var priceDiff = Math.Abs(unitPrice - validPrice.Price);
        var isPriceValid = priceDiff <= tolerance;

        var taxRateValid = true;
        if (taxRate.HasValue)
        {
            var taxTolerance = validPrice.TaxRate * 0.01m;
            var taxDiff = Math.Abs(taxRate.Value - validPrice.TaxRate);
            taxRateValid = taxDiff <= taxTolerance;
        }

        var isValid = isPriceValid && taxRateValid;

        string message;
        if (isValid)
        {
            message = "Fiyat resmi tarifeye uygun.";
        }
        else
        {
            var details = new List<string>();
            if (!isPriceValid)
                details.Add($"Birim fiyat uyuşmazlığı: Girilen {unitPrice:C}, Resmi {validPrice.Price:C}");
            if (!taxRateValid)
                details.Add($"KDV oranı uyuşmazlığı: Girilen %{taxRate}, Resmi %{validPrice.TaxRate}");
            message = string.Join("; ", details);
        }

        return new PriceValidationResult
        {
            IsValid = isValid,
            Message = message,
            OfficialPrice = validPrice.Price,
            OfficialTaxRate = validPrice.TaxRate,
            IsCoveredByStateInsurance = validPrice.IsCoveredByStateInsurance,
            StateCoveragePercentage = validPrice.StateCoveragePercentage
        };
    }
}

public class PriceValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal? OfficialPrice { get; set; }
    public decimal? OfficialTaxRate { get; set; }
    public bool IsCoveredByStateInsurance { get; set; }
    public decimal StateCoveragePercentage { get; set; }
}