using Microsoft.EntityFrameworkCore;
    using Volo.Abp.AuditLogging.EntityFrameworkCore;
    using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
    using Volo.Abp.Data;
    using Volo.Abp.DependencyInjection;
    using Volo.Abp.EntityFrameworkCore;
    using Volo.Abp.FeatureManagement.EntityFrameworkCore;
    using Volo.Abp.Identity;
    using Volo.Abp.Identity.EntityFrameworkCore;
    using Volo.Abp.OpenIddict.EntityFrameworkCore;
    using Volo.Abp.PermissionManagement.EntityFrameworkCore;
    using Volo.Abp.SettingManagement.EntityFrameworkCore;
    using Volo.Abp.TenantManagement;
    using Volo.Abp.TenantManagement.EntityFrameworkCore;
    using Volo.Abp.EntityFrameworkCore.Modeling;

    using MediFlow.Suppliers;
    using MediFlow.Drugs;
    using MediFlow.Warehouses;
    using MediFlow.Inventories;
    using MediFlow.Pharmacies;
    using MediFlow.Customers;
    using MediFlow.Prescriptions;
    using MediFlow.Orders;
    using MediFlow.Shipments;
    using MediFlow.Sales;
    using MediFlow.Returns;
    using MediFlow.Pricing;
    using MediFlow.Invoices;
using MediFlow.Payment;

    namespace MediFlow.EntityFrameworkCore;

    [ReplaceDbContext(typeof(IIdentityDbContext))]
    [ReplaceDbContext(typeof(ITenantManagementDbContext))]
    [ConnectionStringName("Default")]
    public class MediFlowDbContext :
        AbpDbContext<MediFlowDbContext>,
        IIdentityDbContext,
        ITenantManagementDbContext
    {
        /* Add DbSet properties for your Aggregate Roots / Entities here. */

        #region Entities from the modules

        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Drug> Drugs { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<DrugIngredient> DrugIngredients { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<StockBatch> StockBatches { get; set; }
        public DbSet<StockMovementLog> StockMovementLogs { get; set; }
        public DbSet<Pharmacy> Pharmacies { get; set; }
        public DbSet<PharmacyStock> PharmacyStocks { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<ShipmentItem> ShipmentItems { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Return> Returns { get; set; }
        public DbSet<ReturnItem> ReturnItems { get; set; }
        public DbSet<DrugPriceHistory> DrugPriceHistories { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<PaymentTransaction> Payments { get; set; }

        //Identity
        public DbSet<IdentityUser> Users { get; set; }
        public DbSet<IdentityRole> Roles { get; set; }
        public DbSet<IdentityRoleClaim> RoleClaims { get; set; }
        public DbSet<IdentityClaimType> ClaimTypes { get; set; }
        public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
        public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
        public DbSet<IdentityLinkUser> LinkUsers { get; set; }
        public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
        public DbSet<IdentitySession> Sessions { get; set; }
        // Tenant Management
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

        #endregion

        public MediFlowDbContext(DbContextOptions<MediFlowDbContext> options)
            : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            

            /* Include modules to your migration db context */

            builder.ConfigurePermissionManagement();
            builder.ConfigureSettingManagement();
            builder.ConfigureBackgroundJobs();
            builder.ConfigureAuditLogging();
            builder.ConfigureIdentity();
            builder.ConfigureOpenIddict();
            builder.ConfigureFeatureManagement();
            builder.ConfigureTenantManagement();
            /* --- KENDİ TABLO İLİŞKİLERİMİZ VE KISITLAMALARIMIZ --- */

            // 1. Üretim ve İlaç Tanımları
            builder.Entity<Supplier>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Suppliers", MediFlowConsts.DbSchema);
                b.ConfigureByConvention(); // ABP'nin standart kolonlarını (Id, CreationTime vb.) otomatik ekler
                b.Property(x => x.Name).IsRequired().HasMaxLength(128);
                b.Property(x => x.TaxNumber).IsRequired().HasMaxLength(50);
            });

            builder.Entity<Drug>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Drugs", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Name).IsRequired().HasMaxLength(128);
                b.Property(x => x.Barcode).IsRequired().HasMaxLength(50);
                b.Property(x => x.ATCCode).HasMaxLength(20);
            });

            builder.Entity<Ingredient>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Ingredients", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            });

            builder.Entity<DrugIngredient>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "DrugIngredients", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                
                // Çoka-Çok (Many-to-Many) İlişki Bağlantıları
                b.HasOne<Drug>().WithMany().HasForeignKey(x => x.DrugId).IsRequired();
                b.HasOne<Ingredient>().WithMany().HasForeignKey(x => x.IngredientId).IsRequired();
            });

            // 2. Ana Depo ve Stok Yönetimi
            builder.Entity<Warehouse>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Warehouses", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Name).IsRequired().HasMaxLength(128);
            });

            builder.Entity<StockBatch>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "StockBatches", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.LotNumber).IsRequired().HasMaxLength(50);
                b.Property(x => x.ShelfLocation).HasMaxLength(100); // Koridor-A/Raf-3 için uygun uzunluk

                // İlişkiler ve Zorunlu Alanlar (Mandatory Foreign Keys)
                b.HasOne<Drug>().WithMany().HasForeignKey(x => x.DrugId).IsRequired();
                b.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId).IsRequired();
                b.HasOne<Supplier>().WithMany().HasForeignKey(x => x.SupplierId).IsRequired();

                // Optimistic concurrency token - aynı anda iki kullanıcı stok güncellemeye çalışınca lost update önlenir
                b.Property(x => x.RowVersion).IsConcurrencyToken();

                // [K5] Veritabanı indexleri
                b.HasIndex(x => x.DrugId);
                b.HasIndex(x => x.WarehouseId);
                b.HasIndex(x => x.SupplierId);
                b.HasIndex(x => new { x.DrugId, x.ExpirationDate }); // FIFO optimizasyonu
            });

            builder.Entity<StockMovementLog>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "StockMovementLogs", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Description).HasMaxLength(256);
                b.HasIndex(x => new { x.StockBatchId, x.ReferenceType, x.ReferenceId });
            });

            // 3. Eczane, Hasta ve Reçete
            builder.Entity<Pharmacy>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Pharmacies", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Name).IsRequired().HasMaxLength(128);
                b.Property(x => x.GLN).IsRequired().HasMaxLength(13); // İTS Standardı
            });

            builder.Entity<PharmacyStock>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "PharmacyStocks", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.HasIndex(x => new { x.PharmacyId, x.DrugId, x.LotNumber });

                // Optimistic concurrency token - aynı anda iki satış yapılınca lost update önlenir
                b.Property(x => x.RowVersion).IsConcurrencyToken();
            });

            builder.Entity<Customer>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Customers", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.IdentityNumber).IsRequired().HasMaxLength(11); // TCKN
                b.Property(x => x.FirstName).IsRequired().HasMaxLength(64);
                b.Property(x => x.LastName).IsRequired().HasMaxLength(64);
            });

            builder.Entity<Prescription>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Prescriptions", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.EPrescriptionNumber).IsRequired().HasMaxLength(50);
            });

            // 4. Lojistik ve Satış (Finansal Hassasiyetler)
            builder.Entity<Order>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Orders", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.OrderNumber).IsRequired().HasMaxLength(50);
                b.HasIndex(x => x.OrderNumber);
                b.HasIndex(x => x.PharmacyId);
                b.HasIndex(x => x.WarehouseId);
                b.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<OrderItem>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "OrderItems", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.HasOne(x => x.StockBatch)
                 .WithMany()
                 .HasForeignKey(x => x.StockBatchId)
                 .OnDelete(DeleteBehavior.Restrict);
                b.HasOne(x => x.Drug)
                 .WithMany()
                 .HasForeignKey(x => x.DrugId)
                 .OnDelete(DeleteBehavior.Restrict);
                b.HasIndex(x => x.OrderId);
                b.HasIndex(x => x.DrugId);
                b.HasIndex(x => x.StockBatchId);
            });

            builder.Entity<Shipment>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Shipments", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.TrackingNumber).HasMaxLength(100);
                b.HasIndex(x => x.WarehouseId);
                b.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<ShipmentItem>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "ShipmentItems", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
            });

            builder.Entity<Sale>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Sales", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
                b.Property(x => x.Status).HasConversion<int>();
            });

            builder.Entity<SaleItem>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "SaleItems", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            });

            // 5. İade, Fiyatlandırma ve Fatura
            builder.Entity<Return>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Returns", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
            });

            builder.Entity<ReturnItem>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "ReturnItems", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
            });

            builder.Entity<DrugPriceHistory>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "DrugPriceHistories", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.Price).HasColumnType("decimal(18,2)");
                b.Property(x => x.TaxRate).HasColumnType("decimal(5,2)"); // Örn: %8.00
                b.Property(x => x.StateCoveragePercentage).HasColumnType("decimal(5,2)");
            });

            builder.Entity<Invoice>(b =>
            {
                b.ToTable(MediFlowConsts.DbTablePrefix + "Invoices", MediFlowConsts.DbSchema);
                b.ConfigureByConvention();
                b.Property(x => x.InvoiceNumber).IsRequired().HasMaxLength(50);
                b.Property(x => x.SubTotal).HasColumnType("decimal(18,2)");
                b.Property(x => x.TaxTotal).HasColumnType("decimal(18,2)");
                b.Property(x => x.GrandTotal).HasColumnType("decimal(18,2)");
                b.HasIndex(x => x.WarehouseId);
                b.HasOne<Warehouse>().WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<InvoiceItem>(b =>
            {
               b.ToTable(MediFlowConsts.DbTablePrefix + "InvoiceItems", MediFlowConsts.DbSchema);
               b.ConfigureByConvention();
               b.HasOne<Invoice>().WithMany(x => x.Items).HasForeignKey(x => x.InvoiceId).IsRequired();
            });
        builder.Entity<Return>(b =>
            {
               b.ToTable(MediFlowConsts.DbTablePrefix + "Returns", MediFlowConsts.DbSchema);
               b.ConfigureByConvention();

                // Invoice ilişkisi
               b.HasOne<Invoice>()
                    .WithMany()
                    .HasForeignKey(x => x.InvoiceId)
                    .IsRequired(false); // Eğer zorunlu olacaksa true yapabilirsin
            });

            /* Configure your own tables/entities inside here */
        }
    }