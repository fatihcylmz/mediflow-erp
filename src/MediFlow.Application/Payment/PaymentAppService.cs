using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Uow;
using MediFlow.Payment;
using MediFlow.Application.Contracts.Payment;
using MediFlow.Invoices;

namespace MediFlow.Application.Payment;

public class PaymentAppService : ApplicationService, IPaymentAppService
{
    private readonly IRepository<PaymentMethod, Guid> _paymentMethodRepository;
    private readonly IRepository<PaymentTransaction, Guid> _paymentTransactionRepository;
    private readonly IRepository<Invoice, Guid> _invoiceRepository;

    public PaymentAppService(
        IRepository<PaymentMethod, Guid> paymentMethodRepository,
        IRepository<PaymentTransaction, Guid> paymentTransactionRepository,
        IRepository<Invoice, Guid> invoiceRepository)
    {
        _paymentMethodRepository = paymentMethodRepository;
        _paymentTransactionRepository = paymentTransactionRepository;
        _invoiceRepository = invoiceRepository;
    }

    // CRUD Operations - PaymentMethod
    public async Task<PaymentMethodDto> CreateAsync(CreateUpdatePaymentMethodDto input)
    {
        var existing = await _paymentMethodRepository.FirstOrDefaultAsync(m => m.Code == input.Code);
        if (existing != null && existing.Id != Guid.Empty)
            throw new UserFriendlyException($"Bu ödeme kodu ({input.Code}) zaten kullanılıyor.");

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
        var method = await _paymentMethodRepository.GetAsync(id);
        // Bu yöntemle yapılan işlem varsa silinemez
        var usedTransactions = await _paymentTransactionRepository.CountAsync(t => t.PaymentMethodId == id);
        if (usedTransactions > 0)
            throw new UserFriendlyException("Bu ödeme yöntemi kullanılan kayıtlar nedeniyle silinemez.");

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

    // CRUD Operations - PaymentTransaction
    [UnitOfWork]
    public async Task<PaymentTransactionDto> CreatePaymentTransactionAsync(CreateUpdatePaymentTransactionDto input)
    {
        // Fatura kontrolü
        var invoice = await _invoiceRepository.GetAsync(input.InvoiceId);
        if (invoice.Status == InvoiceStatus.Paid)
            throw new UserFriendlyException("Bu fatura zaten ödenmiş durumda.");

        // Tutar kontrolü
        if (input.Amount > invoice.GrandTotal)
            throw new UserFriendlyException($"Ödeme tutarı ({input.Amount:C2}) fatura toplamını ({invoice.GrandTotal:C2}) aşıyor.");

        if (input.Amount <= 0)
            throw new UserFriendlyException("Geçersiz ödeme tutarı girildi.");

        // Ödeme yöntemi kontrolü
        var paymentMethod = await _paymentMethodRepository.GetAsync(input.PaymentMethodId);
        if (!paymentMethod.IsActive)
            throw new UserFriendlyException("Seçilen ödeme yöntemi aktif değil.");

        // İşlem referansı kontrolü
        if (!string.IsNullOrWhiteSpace(input.TransactionReference))
        {
            var existingTrans = await _paymentTransactionRepository.FirstOrDefaultAsync(t =>
                t.TransactionReference == input.TransactionReference);
            if (existingTrans != null)
                throw new UserFriendlyException("Bu işlem referans numarası zaten kullanılıyor.");
        }

        // Ücret hesaplama
        decimal fee = input.Amount * (paymentMethod.FeePercentage.GetValueOrDefault() / 100m);

        var transaction = new PaymentTransaction
        {
            InvoiceId = input.InvoiceId,
            PaymentMethodId = input.PaymentMethodId,
            Amount = input.Amount,
            FeeAmount = fee,
            NetAmount = input.Amount - fee,
            PaymentDate = input.PaymentDate.GetValueOrDefault(DateTime.Now),
            TransactionReference = input.TransactionReference,
            Notes = input.Notes,
            Status = (PaymentStatus)input.Status
        };

        var inserted = await _paymentTransactionRepository.InsertAsync(transaction);

        // Fatura durumunu güncelle
        if (transaction.Status == PaymentStatus.Completed)
        {
            invoice.Status = InvoiceStatus.Paid;
            await _invoiceRepository.UpdateAsync(invoice);
        }

        return new PaymentTransactionDto
        {
            Id = inserted.Id,
            InvoiceId = inserted.InvoiceId,
            PaymentMethodId = inserted.PaymentMethodId,
            Amount = inserted.Amount,
            FeeAmount = inserted.FeeAmount,
            NetAmount = inserted.NetAmount,
            PaymentDate = inserted.PaymentDate,
            TransactionReference = inserted.TransactionReference,
            Notes = inserted.Notes,
            Status = (int)inserted.Status
        };
    }

    public async Task<PaymentTransactionDto> UpdatePaymentTransactionAsync(Guid id, CreateUpdatePaymentTransactionDto input)
    {
        var transaction = await _paymentTransactionRepository.GetAsync(id);

        // Tamamlanmış işlemlerde durum değişikliği kısıtı
        if (transaction.Status == PaymentStatus.Completed && input.Status == 1)
            throw new UserFriendlyException("Tamamlanmış ödeme işleminde durum değiştirilemez.");

        transaction.InvoiceId = input.InvoiceId;
        transaction.PaymentMethodId = input.PaymentMethodId;
        transaction.Amount = input.Amount;
        transaction.PaymentDate = input.PaymentDate.GetValueOrDefault(transaction.PaymentDate);
        transaction.TransactionReference = input.TransactionReference;
        transaction.Notes = input.Notes;
        transaction.Status = (PaymentStatus)input.Status;

        var updated = await _paymentTransactionRepository.UpdateAsync(transaction);
        return new PaymentTransactionDto
        {
            Id = updated.Id,
            InvoiceId = updated.InvoiceId,
            PaymentMethodId = updated.PaymentMethodId,
            Amount = updated.Amount,
            FeeAmount = updated.FeeAmount,
            NetAmount = updated.NetAmount,
            PaymentDate = updated.PaymentDate,
            TransactionReference = updated.TransactionReference,
            Notes = updated.Notes,
            Status = (int)updated.Status
        };
    }

    public async Task DeletePaymentTransactionAsync(Guid id)
    {
        var transaction = await _paymentTransactionRepository.GetAsync(id);
        if (transaction.Status == PaymentStatus.Completed)
            throw new UserFriendlyException("Tamamlanmış ödeme kaydı silinemez.");

        // İptal edilen ödemede fatura durumunu sıfırla
        if (transaction.Status == PaymentStatus.Cancelled)
        {
            var invoice = await _invoiceRepository.GetAsync(transaction.InvoiceId);
            if (invoice.Status == InvoiceStatus.Paid)
                invoice.Status = InvoiceStatus.Issued;
            await _invoiceRepository.UpdateAsync(invoice);
        }

        await _paymentTransactionRepository.DeleteAsync(id);
    }

    public async Task<PaymentTransactionDto> GetPaymentTransactionAsync(Guid id)
    {
        var transaction = await _paymentTransactionRepository.GetAsync(id);
        return new PaymentTransactionDto
        {
            Id = transaction.Id,
            InvoiceId = transaction.InvoiceId,
            PaymentMethodId = transaction.PaymentMethodId,
            Amount = transaction.Amount,
            FeeAmount = transaction.FeeAmount,
            NetAmount = transaction.NetAmount,
            PaymentDate = transaction.PaymentDate,
            TransactionReference = transaction.TransactionReference,
            Notes = transaction.Notes,
            Status = (int)transaction.Status
        };
    }

    public async Task<List<PaymentTransactionDto>> GetPaymentTransactionListAsync()
    {
        var transactions = await _paymentTransactionRepository.GetListAsync();
        return transactions.Select(t => new PaymentTransactionDto
        {
            Id = t.Id,
            InvoiceId = t.InvoiceId,
            PaymentMethodId = t.PaymentMethodId,
            Amount = t.Amount,
            FeeAmount = t.FeeAmount,
            NetAmount = t.NetAmount,
            PaymentDate = t.PaymentDate,
            TransactionReference = t.TransactionReference,
            Notes = t.Notes,
            Status = (int)t.Status
        }).ToList();
    }
}