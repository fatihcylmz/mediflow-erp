using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MediFlow.Payment;

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
            .Property(x => x.TransactionReference)
            .HasMaxLength(64);

        builder
            .HasOne(x => x.Invoice)
            .WithOne()
            .HasForeignKey<PaymentTransaction>(x => x.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(x => x.PaymentMethod)
            .WithOne()
            .HasForeignKey<PaymentTransaction>(x => x.PaymentMethodId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}