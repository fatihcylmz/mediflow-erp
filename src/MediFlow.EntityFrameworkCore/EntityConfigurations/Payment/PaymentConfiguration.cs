using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MediFlow.Payment;
using MediFlow.Sales;

namespace MediFlow.EntityFrameworkCore.EntityConfigurations.Payment;

public class PaymentConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder
            .ToTable("PaymentTransactions")
            .HasKey(x => x.Id);

        builder
            .Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder
            .Property(x => x.FeeAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder
            .Property(x => x.NetAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder
            .Property(x => x.TransactionReference)
            .HasMaxLength(64);

        // Fatura bağlantısı isteğe bağlı (bağımsız ödeme işlemleri için):
        // ÖdemeTransaction, fatura/satış referanslı DAHA İSTİNDEKİ BAĞIMSIZ
        // şekilde işlem görebilir.
        builder
            .HasOne(x => x.Invoice)
            .WithOne()
            .HasForeignKey<PaymentTransaction>(x => x.InvoiceId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        // Satış bağlantısı da isteğe bağlıdır (faturası olmayan satış ödemeleri):
        builder
            .HasOne<Sale>()
            .WithMany()
            .HasForeignKey(x => x.SaleId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(x => x.PaymentMethod)
            .WithOne()
            .HasForeignKey<PaymentTransaction>(x => x.PaymentMethodId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
