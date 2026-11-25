# Graph Report - aspnet-core  (2026-11-23)

## Corpus Check
- 377 files · ~167,104 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 7, .css 4, .Config 1)

## Summary
- 3558 nodes · 9730 edges · 128 communities (116 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 743 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend Build Assets
- Backend Controllers & Seed Data
- Migration History & Core Modules
- Domain Modules (Shipments, Pharmacies, Warehouses, Inventories, Orders, Payment)
- Frontend Test Assets (Minified)
- Frontend Test Assets (Minified)
- Frontend Test Assets (Minified)
- Frontend Test Assets (Minified)
- User Management & Identity
- Core Domain Constants & Localization
- Frontend Components & Pages (Drug, Invoice, Pharmacy)
- Domain Module References (Sales, Payment, Drugs, etc.)
- Sales DTOs & Contracts (CreateUpdateSaleDto, SaleDto)
- Frontend Test Assets (Minified)
- Frontend Package Dependencies (package.json)
- Payment AppService & DTOs
- Application Module Configuration
- Frontend Test Assets (Minified)
- Drug Ingredient DTOs & Shipment Items
- Docker Compose Configuration
- EF Core DbContext & Entity Sets
- Frontend Test Assets (Minified)
- Database Migration & Seed Services
- Invoice & Return Services with Price Validation
- Order DTOs & Contracts
- Dashboard Controllers & HTTP API
- Stock Batch DTOs & Contracts
- Frontend Dependencies (Secondary)
- Stock Movement Log DTOs & Contracts
- Multi-tenancy & DbMigrator
- Frontend Test Assets (Minified)
- Shipment DTOs & Contracts
- Order Item DTOs & Contracts
- Frontend Component Lifecycle (React)
- Dashboard DTOs & Filters
- UI Components (Badge, Button, Card)
- Return Item DTOs & Contracts
- Frontend Layout & Admin Pages (App, Dashboard)
- Payment Method DTOs & Contracts
- Pharmacy DTOs & Contracts
- Drug Price History DTOs & Contracts
- Supplier DTOs & Contracts
- Frontend Test Assets (Minified)
- Return DTOs & Contracts
- Customer DTOs & Contracts
- Ingredient DTOs & Contracts
- Prescription DTOs & Contracts
- Frontend Test Assets (Minified)
- Payment Entity Configuration & Status Enum
- Pharmacy Stock DTOs & Contracts
- Warehouse DTOs & Contracts
- Frontend Test Assets (Minified)
- Sale Item DTOs & Contracts
- Color Utility Functions
- TypeScript Compiler Options
- Community 55
- EF Core Module Configuration
- DbMigrator & Console Test App
- Test Base Classes
- Entity Framework Core Test Modules
- Core ABP Module Definitions
- Invoice Item DTOs & Mappers
- Dashboard Statistics & Trends
- Invoice DTOs & Mappers
- Frontend Utility Functions
- TypeScript Config (Secondary)
- Community 66
- NuGet Package Dependencies (Http Clients)
- Drug DTOs & Create/Update
- Drug DTOs (Read)
- Invoice DTOs (Create/Update)
- Drug Mappers
- Test Project Dependencies
- Invoice DTOs (Read)
- User Creation DTOs
- User Creation DTOs (Duplicate)
- Frontend Layout Components (Admin, Pharmacy, Supplier, Warehouse)
- Test Dependencies (NSubstitute, Shouldly, xUnit)
- Application Layer NuGet Dependencies
- Web Layer NuGet Dependencies (Serilog, Swagger)
- Entity Framework Core NuGet Dependencies
- Domain Layer NuGet Dependencies
- Admin Controller & Login DTOs
- Permission & Branding Definitions
- Domain Shared NuGet Dependencies
- Community 85
- Frontend Utility Functions (Minified)
- User Management Modal & Role Filters
- Application Contracts NuGet Dependencies
- User Update Input DTOs
- Settings Configuration
- Docker Compose Services Config
- Docker Compose Database Config
- Frontend Type Definitions (Drug, Invoice, Pharmacy, etc.)
- Serilog & Logging Dependencies
- HTTP API NuGet Dependencies
- User Creation DTOs (Duplicate)
- Docker Compose Backend Service
- Core Domain Entities (Customer, Drug, Pharmacy, Sale, StockBatch)
- Drug Form Enum
- Prescription Type Enum
- Inventory Domain Entities (Drug, StockBatch, StockMovementLog, Supplier, Warehouse)
- Logistics Domain Entities (Order, Shipment, Pharmacy)
- Frontend LeptonX Theme Package
- Price Validation Result DTO
- Invoice Status Enum
- Docker Build Context
- Docker Health Check Config
- Community 108
- Minified Frontend Functions
- Minified Frontend Functions
- ESLint Configuration
- Stock Batch Status Enum
- Community 113
- Community 114
- Test Model
- Docker Compose Frontend Service
- Docker Compose Frontend Common Config
- Docker Compose Backend Common Config
- Minified Functions
- Minified Functions
- Minified Functions
- Community 124

## God Nodes (most connected - your core abstractions)
1. `t()` - 238 edges
2. `n()` - 231 edges
3. `s()` - 84 edges
4. `MediFlowDbContext` - 82 edges
5. `l()` - 69 edges
6. `c()` - 60 edges
7. `ol()` - 40 edges
8. `StockMovementLog` - 38 edges
9. `D()` - 37 edges
10. `StockBatch` - 36 edges

## Surprising Connections (you probably didn't know these)
- `AdminPages()` --calls--> `UserManagementPage()`  [EXTRACTED]
  mediflow-frontend/src/App.tsx → mediflow-frontend/src/components/UserManagement/UserManagementPage.tsx
- `AdminPages()` --calls--> `DrugPriceHistoryList()`  [EXTRACTED]
  mediflow-frontend/src/App.tsx → mediflow-frontend/src/pages/DrugPriceHistoryList.tsx
- `AdminPages()` --calls--> `ReturnList()`  [EXTRACTED]
  mediflow-frontend/src/App.tsx → mediflow-frontend/src/pages/ReturnList.tsx
- `Card` --calls--> `cn()`  [EXTRACTED]
  mediflow-frontend/src/components/ui/card.tsx → mediflow-frontend/src/lib/utils.ts
- `CardHeader` --calls--> `cn()`  [EXTRACTED]
  mediflow-frontend/src/components/ui/card.tsx → mediflow-frontend/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (128 total, 12 thin omitted)

### Community 0 - "Frontend Build Assets"
Cohesion: 0.01
Nodes (115): aj(), Ay(), bc(), Bx(), cl(), cm(), componentDidMount(), componentDidUpdate() (+107 more)

### Community 1 - "Backend Controllers & Seed Data"
Cohesion: 0.03
Nodes (20): PharmaDataSeedContributor, CustomerController, DrugController, DrugPriceHistoryController, IngredientController, InvoiceController, OrderController, OrderItemController (+12 more)

### Community 2 - "Migration History & Core Modules"
Cohesion: 0.05
Nodes (21): MediFlow.EntityFrameworkCore, MediFlow.Migrations, Added_Pharma_Modules, AddOrderIdToShipment, Update_Drug_Schema_And_Relations, Add_SupplierId_To_StockBatch, AddInvoiceItems, UpdateReturnAndReturnItemSchema (+13 more)

### Community 3 - "Domain Modules (Shipments, Pharmacies, Warehouses, Inventories, Orders, Payment)"
Cohesion: 0.07
Nodes (8): MediFlow.Shipments, MediFlow.Pharmacies, MediFlow.Warehouses, MediFlow.Inventories, MediFlow.Orders, MediFlow.Application.Contracts.Payment, MediFlow.Services, MediFlow.Application.Payment

### Community 4 - "Frontend Test Assets (Minified)"
Cohesion: 0.10
Nodes (82): _A(), b(), bA(), Bh(), c(), cA(), cancel(), cf() (+74 more)

### Community 5 - "Frontend Test Assets (Minified)"
Cohesion: 0.05
Nodes (78): af(), ah(), at(), Bd(), cd(), Ch(), cn(), ct() (+70 more)

### Community 6 - "Frontend Test Assets (Minified)"
Cohesion: 0.06
Nodes (73): ae(), bj(), ce(), cj(), de(), Dh(), dj(), E() (+65 more)

### Community 7 - "Frontend Test Assets (Minified)"
Cohesion: 0.06
Nodes (73): Au(), bl(), bm(), bu(), di(), dl(), Dp(), du() (+65 more)

### Community 8 - "User Management & Identity"
Cohesion: 0.05
Nodes (39): IUserManagementAppService, SetPasswordInput, NewPassword, UserId, UpdateUserDto, Address, Email, Name (+31 more)

### Community 9 - "Core Domain Constants & Localization"
Cohesion: 0.06
Nodes (10): MediFlow.Localization, MediFlow.Permissions, MediFlow, MediFlow.Samples, MediFlow.DataSeedContributors, MediFlow.EntityFrameworkCore.Samples, MediFlowPermissions, MediFlowConsts (+2 more)

### Community 10 - "Frontend Components & Pages (Drug, Invoice, Pharmacy)"
Cohesion: 0.06
Nodes (36): AppServiceContext, Drug, DrugIngredient, Ingredient, Drug, DrugPriceHistory, DrugPriceHistoryList(), Ingredient (+28 more)

### Community 11 - "Domain Module References (Sales, Payment, Drugs, etc.)"
Cohesion: 0.06
Nodes (9): MediFlow.Sales, MediFlow.Payment, MediFlow.Ingredients, MediFlow.Suppliers, MediFlow.Drugs, MediFlow.Customers, MediFlow.Pricing, MediFlow.Returns (+1 more)

### Community 12 - "Sales DTOs & Contracts (CreateUpdateSaleDto, SaleDto)"
Cohesion: 0.05
Nodes (43): CreateUpdateSaleDto, CustomerId, InvoiceId, Items, OrderId, PharmacyId, PrescriptionId, SaleDate (+35 more)

### Community 13 - "Frontend Test Assets (Minified)"
Cohesion: 0.08
Nodes (51): as(), bo(), bs(), ds(), es(), Fo(), fs(), go() (+43 more)

### Community 14 - "Frontend Package Dependencies (package.json)"
Cohesion: 0.05
Nodes (51): dependencies, @ant-design/icons@^6.3.4, antd@^6.6.5, axios@^1.20.0, class-variance-authority@^0.7.1, clsx@^2.1.1, lucide-react@^1.76.0, qrcode.react@^4.2.0 (+43 more)

### Community 15 - "Payment AppService & DTOs"
Cohesion: 0.07
Nodes (22): IPaymentAppService, CreateUpdatePaymentTransactionDto, Amount, InvoiceId, Notes, PaymentDate, PaymentMethodId, Status (+14 more)

### Community 16 - "Application Module Configuration"
Cohesion: 0.06
Nodes (10): MediFlow.Users, MediFlow.Invoices, MediFlow.Application.Configuration, MediFlow.Security, MediFlow.Application.Services, MediFlow.Data, MediFlow.OpenIddict, MediFlowConfiguration (+2 more)

### Community 17 - "Frontend Test Assets (Minified)"
Cohesion: 0.06
Nodes (49): ag(), be(), bi(), Cc(), co(), componentDidCatch(), ec(), el() (+41 more)

### Community 18 - "Drug Ingredient DTOs & Shipment Items"
Cohesion: 0.07
Nodes (35): CreateUpdateDrugIngredientDto, Amount, DrugId, IngredientId, Unit, DrugIngredientDto, Amount, DrugId (+27 more)

### Community 19 - "Docker Compose Configuration"
Cohesion: 0.05
Nodes (47): context, dockerfile, mediflow-db, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+39 more)

### Community 20 - "EF Core DbContext & Entity Sets"
Cohesion: 0.04
Nodes (35): MediFlowDbContext, ClaimTypes, Customers, DrugIngredients, DrugPriceHistories, Drugs, Ingredients, InvoiceItems (+27 more)

### Community 21 - "Frontend Test Assets (Minified)"
Cohesion: 0.09
Nodes (46): ac(), al(), ao(), Ci(), dm(), Do(), ea(), Ei() (+38 more)

### Community 22 - "Database Migration & Seed Services"
Cohesion: 0.07
Nodes (9): UserInitializationService, IMediFlowDbSchemaMigrator, MediFlowDbMigrationService, Logger, NullMediFlowDbSchemaMigrator, EntityFrameworkCoreMediFlowDbSchemaMigrator, UserDataSeedContributor, ClientDemoService (+1 more)

### Community 23 - "Invoice & Return Services with Price Validation"
Cohesion: 0.11
Nodes (5): IInvoiceAppService, InvoiceAppService, ReturnAppService, PriceValidationService, SampleRepositoryTests

### Community 24 - "Order DTOs & Contracts"
Cohesion: 0.07
Nodes (33): CreateUpdateOrderDto, CustomerId, Items, Notes, OrderDate, OrderNumber, PharmacyId, Status (+25 more)

### Community 25 - "Dashboard Controllers & HTTP API"
Cohesion: 0.14
Nodes (6): MediFlow.Application.Dashboard, MediFlow.HttpApi.Controllers, MediFlow.Dashboard, MediFlow.Controllers, MediFlowController, HomeController

### Community 26 - "Stock Batch DTOs & Contracts"
Cohesion: 0.06
Nodes (35): CreateUpdateStockBatchDto, DrugId, ExpirationDate, IsQuarantined, LotNumber, Quantity, ReservedQuantity, ShelfLocation (+27 more)

### Community 27 - "Frontend Dependencies (Secondary)"
Cohesion: 0.06
Nodes (42): dependencies, class-variance-authority@^0.7.0, clsx@^2.1.0, lucide-react@^0.474.0, @radix-ui/react-slot@^2.0.2, react@^19.2.8, react-dom@^19.2.8, react-router-dom@^7.18.4 (+34 more)

### Community 28 - "Stock Movement Log DTOs & Contracts"
Cohesion: 0.06
Nodes (37): CreateUpdateStockMovementLogDto, Description, MovementType, QuantityChange, ReferenceId, StockBatchId, IStockMovementLogAppService, StockMovementLogDto (+29 more)

### Community 29 - "Multi-tenancy & DbMigrator"
Cohesion: 0.07
Nodes (4): MediFlow.HttpApi.Client.ConsoleTestApp, MediFlow.MultiTenancy, MediFlow.DbMigrator, MultiTenancyConsts

### Community 30 - "Frontend Test Assets (Minified)"
Cohesion: 0.08
Nodes (40): Ar(), bf(), c(), l(), br(), Cr(), cs(), Dn() (+32 more)

### Community 31 - "Shipment DTOs & Contracts"
Cohesion: 0.07
Nodes (31): CreateUpdateShipmentDto, DeliveryDate, OrderId, PharmacyId, ShipmentDate, Status, TrackingNumber, ShipmentDto (+23 more)

### Community 32 - "Order Item DTOs & Contracts"
Cohesion: 0.09
Nodes (25): CreateUpdateOrderItemDto, ApprovedQuantity, DrugId, OrderId, RequestedQuantity, IOrderItemAppService, OrderItemDto, ApprovedQuantity (+17 more)

### Community 33 - "Frontend Component Lifecycle (React)"
Cohesion: 0.06
Nodes (27): AV(), e(), Bk(), Bp(), Fp(), getDerivedStateFromProps(), getType(), getValidationMethod() (+19 more)

### Community 34 - "Dashboard DTOs & Filters"
Cohesion: 0.07
Nodes (30): DashboardFilterDto, EndDate, Period, PharmacyId, StartDate, WarehouseId, DashboardStatsDto, CriticalStockCount (+22 more)

### Community 35 - "UI Components (Badge, Button, Card)"
Cohesion: 0.10
Nodes (24): Badge, BadgeProps, badgeVariants, Button, ButtonProps, buttonVariants, Card, CardContent (+16 more)

### Community 36 - "Return Item DTOs & Contracts"
Cohesion: 0.07
Nodes (30): CreateUpdateReturnItemDto, DrugId, LineTotal, Quantity, Reason, ReturnId, StockBatchId, TaxRate (+22 more)

### Community 37 - "Frontend Layout & Admin Pages (App, Dashboard)"
Cohesion: 0.15
Nodes (29): AdminPages(), App(), AppContent(), Dashboard(), DashboardGrafikler(), DashboardOzet(), DonutChart(), getRole() (+21 more)

### Community 38 - "Payment Method DTOs & Contracts"
Cohesion: 0.10
Nodes (23): CreateUpdatePaymentMethodDto, Code, Description, FeePercentage, IsActive, Name, RequiresApproval, PaymentMethodDto (+15 more)

### Community 39 - "Pharmacy DTOs & Contracts"
Cohesion: 0.08
Nodes (28): CreateUpdatePharmacyDto, Address, GLN, Name, PharmacistLicenseNumber, PharmacistName, PhoneNumber, TaxNumber (+20 more)

### Community 40 - "Drug Price History DTOs & Contracts"
Cohesion: 0.08
Nodes (28): CreateUpdateDrugPriceHistoryDto, DrugId, IsCoveredByStateInsurance, Price, StateCoveragePercentage, TaxRate, ValidFrom, ValidTo (+20 more)

### Community 41 - "Supplier DTOs & Contracts"
Cohesion: 0.09
Nodes (25): CreateUpdateSupplierDto, ContactName, ContactSurname, Email, Name, PhoneNumber, TaxNumber, ISupplierAppService (+17 more)

### Community 42 - "Frontend Test Assets (Minified)"
Cohesion: 0.11
Nodes (29): am(), an(), ap(), Bt(), en(), Gt(), hn(), Ht() (+21 more)

### Community 43 - "Return DTOs & Contracts"
Cohesion: 0.09
Nodes (26): CreateUpdateReturnDto, InvoiceId, PharmacyId, ReturnDate, Status, TrackingNumber, IReturnAppService, ReturnDto (+18 more)

### Community 44 - "Customer DTOs & Contracts"
Cohesion: 0.10
Nodes (22): CreateUpdateCustomerDto, DateOfBirth, FirstName, IdentityNumber, LastName, PhoneNumber, CustomerDto, DateOfBirth (+14 more)

### Community 45 - "Ingredient DTOs & Contracts"
Cohesion: 0.10
Nodes (22): CreateUpdateIngredientDto, Description, Name, Type, IIngredientAppService, IngredientDto, Description, Name (+14 more)

### Community 46 - "Prescription DTOs & Contracts"
Cohesion: 0.09
Nodes (25): CreateUpdatePrescriptionDto, CustomerId, DoctorDiplomaNumber, DoctorName, EPrescriptionNumber, HospitalName, IssueDate, IPrescriptionAppService (+17 more)

### Community 47 - "Frontend Test Assets (Minified)"
Cohesion: 0.11
Nodes (28): A(), aa(), r(), ak(), ck(), dk(), ek(), fa() (+20 more)

### Community 48 - "Payment Entity Configuration & Status Enum"
Cohesion: 0.08
Nodes (21): MediFlow.EntityFrameworkCore.EntityConfigurations.Payment, PaymentStatus, Cancelled, Completed, Failed, Pending, Refunded, PaymentTransaction (+13 more)

### Community 49 - "Pharmacy Stock DTOs & Contracts"
Cohesion: 0.10
Nodes (23): CreateUpdatePharmacyStockDto, DrugId, ExpirationDate, LotNumber, PharmacyId, Quantity, IPharmacyStockAppService, PharmacyStockDto (+15 more)

### Community 50 - "Warehouse DTOs & Contracts"
Cohesion: 0.12
Nodes (19): CreateUpdateWarehouseDto, HasColdStorage, LocationAddress, ManagerName, Name, IWarehouseAppService, WarehouseDto, HasColdStorage (+11 more)

### Community 51 - "Frontend Test Assets (Minified)"
Cohesion: 0.25
Nodes (22): Ai(), eo(), Ka(), H(), Mi(), Qa(), to(), a() (+14 more)

### Community 52 - "Sale Item DTOs & Contracts"
Cohesion: 0.13
Nodes (19): CreateUpdateSaleItemDto, Quantity, SaleId, StockBatchId, UnitPrice, ISaleItemAppService, SaleItemDto, Quantity (+11 more)

### Community 53 - "Color Utility Functions"
Cohesion: 0.15
Nodes (23): _c(), clone(), darken(), getHSLSaturation(), getHSVSaturation(), getHue(), getLightness(), getMax() (+15 more)

### Community 54 - "TypeScript Compiler Options"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 56 - "EF Core Module Configuration"
Cohesion: 0.12
Nodes (7): MediFlowApplicationContractsModule, MediFlowDtoExtensions, MediFlowGlobalFeatureConfigurator, MediFlowModuleExtensionConfigurator, MediFlowDbContextFactory, MediFlowEfCoreEntityExtensionMappings, MediFlowEntityFrameworkCoreModule

### Community 57 - "DbMigrator & Console Test App"
Cohesion: 0.12
Nodes (6): DbMigratorHostedService, MediFlowDbMigratorModule, Program, ConsoleTestAppHostedService, MediFlowConsoleApiClientModule, Program

### Community 58 - "Test Base Classes"
Cohesion: 0.15
Nodes (4): MediFlowApplicationTestBase, SampleAppServiceTests, MediFlowDomainTestBase, MediFlowTestBase

### Community 59 - "Entity Framework Core Test Modules"
Cohesion: 0.11
Nodes (6): MediFlow.EntityFrameworkCore.Applications, MediFlow.EntityFrameworkCore.Domains, EfCoreSampleAppServiceTests, EfCoreSampleDomainTests, MediFlowEntityFrameworkCoreTestBase, MediFlowEntityFrameworkCoreTestModule

### Community 60 - "Core ABP Module Definitions"
Cohesion: 0.13
Nodes (6): MediFlowDomainModule, MediFlowDomainSharedModule, MediFlowHttpApiClientModule, MediFlowHttpApiModule, MediFlowApplicationTestModule, MediFlowDomainTestModule

### Community 61 - "Invoice Item DTOs & Mappers"
Cohesion: 0.13
Nodes (16): InvoiceItemDto, DrugId, LineTotal, Quantity, StockBatchId, TaxRate, UnitPrice, InvoiceItemToInvoiceItemDtoMapper (+8 more)

### Community 62 - "Dashboard Statistics & Trends"
Cohesion: 0.11
Nodes (18): CategoryStat, Name, Value, DailyStat, Amount, Count, Date, DashboardTrendDto (+10 more)

### Community 63 - "Invoice DTOs & Mappers"
Cohesion: 0.14
Nodes (12): InvoiceToInvoiceDtoMapper, Invoice, DueDate, GrandTotal, InvoiceNumber, IssueDate, Items, PharmacyId (+4 more)

### Community 64 - "Frontend Utility Functions"
Cohesion: 0.17
Nodes (17): accessor(), r(), delete(), i(), deleteByPath(), get(), getAsPrefix(), getSetCookie() (+9 more)

### Community 65 - "TypeScript Config (Secondary)"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 67 - "NuGet Package Dependencies (Http Clients)"
Cohesion: 0.12
Nodes (14): Microsoft.Extensions.Http.Polly (10.0.9), Volo.Abp.Account.HttpApi.Client (10.6.1), Volo.Abp.FeatureManagement.HttpApi.Client (10.6.1), Volo.Abp.Http.Client.IdentityModel (10.6.1), Volo.Abp.Identity.HttpApi.Client (10.6.1), Volo.Abp.PermissionManagement.HttpApi.Client (10.6.1), Volo.Abp.SettingManagement.HttpApi.Client (10.6.1), Volo.Abp.TenantManagement.HttpApi.Client (10.6.1) (+6 more)

### Community 68 - "Drug DTOs & Create/Update"
Cohesion: 0.13
Nodes (15): CreateUpdateDrugDto, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel, Name (+7 more)

### Community 69 - "Drug DTOs (Read)"
Cohesion: 0.14
Nodes (14): DrugDto, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel, Name (+6 more)

### Community 70 - "Invoice DTOs (Create/Update)"
Cohesion: 0.15
Nodes (12): CreateUpdateInvoiceDto, DueDate, GrandTotal, InvoiceNumber, IssuedDate, Items, PharmacyId, ShipmentId (+4 more)

### Community 71 - "Drug Mappers"
Cohesion: 0.14
Nodes (14): CreateUpdateDrugDtoToDrugMapper, Drug, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel (+6 more)

### Community 72 - "Test Project Dependencies"
Cohesion: 0.15
Nodes (11): Volo.Abp.EntityFrameworkCore.Sqlite (10.6.1), net10.0, Microsoft.NET.Test.Sdk (17.14.1), Microsoft.NET.Sdk, net10.0, Microsoft.NET.Test.Sdk (17.14.1), Microsoft.NET.Sdk, net10.0 (+3 more)

### Community 73 - "Invoice DTOs (Read)"
Cohesion: 0.14
Nodes (13): InvoiceDto, DueDate, GrandTotal, InvoiceNumber, IssuedDate, Items, PharmacyId, PharmacyName (+5 more)

### Community 74 - "User Creation DTOs"
Cohesion: 0.13
Nodes (15): CreateUserDto, Address, Email, Name, Password, PharmacyGln, PharmacyName, PhoneNumber (+7 more)

### Community 75 - "User Creation DTOs (Duplicate)"
Cohesion: 0.13
Nodes (15): CreateUserDtoDto, Address, Email, Name, Password, PhoneNumber, RoleName, Surname (+7 more)

### Community 76 - "Frontend Layout Components (Admin, Pharmacy, Supplier, Warehouse)"
Cohesion: 0.25
Nodes (8): AdminLayout(), MainLayout(), MainLayoutProps, RoleType, NewAdminLayout(), PharmacyLayout(), SupplierLayout(), WarehouseLayout()

### Community 77 - "Test Dependencies (NSubstitute, Shouldly, xUnit)"
Cohesion: 0.14
Nodes (13): NSubstitute (5.3.0), NSubstitute.Analyzers.CSharp (1.0.17), Shouldly (4.3.0), Volo.Abp.BackgroundJobs.Abstractions (10.6.1), Volo.Abp.TestBase (10.6.1), xunit (2.9.3), xunit.extensibility.execution (2.9.3), xunit.runner.visualstudio (3.1.4) (+5 more)

### Community 78 - "Application Layer NuGet Dependencies"
Cohesion: 0.15
Nodes (12): Microsoft.AspNetCore.Authorization (10.0.9), Microsoft.EntityFrameworkCore (10.0.0), Volo.Abp.Account.Application (10.6.1), Volo.Abp.FeatureManagement.Application (10.6.1), Volo.Abp.Identity.Application (10.6.1), Volo.Abp.PermissionManagement.Application (10.6.1), Volo.Abp.SettingManagement.Application (10.6.1), Volo.Abp.TenantManagement.Application (10.6.1) (+4 more)

### Community 79 - "Web Layer NuGet Dependencies (Serilog, Swagger)"
Cohesion: 0.15
Nodes (12): Microsoft.EntityFrameworkCore.Design (10.0.14), Serilog.AspNetCore (9.0.0), Volo.Abp.Account.Web.OpenIddict (10.6.1), Volo.Abp.AspNetCore.MultiTenancy (10.6.1), Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite (5.4.0-preview*), Volo.Abp.AspNetCore.Serilog (10.6.1), Volo.Abp.Swashbuckle (10.6.1), Microsoft.NET.Sdk.Web (+4 more)

### Community 80 - "Entity Framework Core NuGet Dependencies"
Cohesion: 0.15
Nodes (12): Microsoft.EntityFrameworkCore.Tools (10.0.9), Volo.Abp.AuditLogging.EntityFrameworkCore (10.6.1), Volo.Abp.BackgroundJobs.EntityFrameworkCore (10.6.1), Volo.Abp.EntityFrameworkCore.PostgreSql (10.6.1), Volo.Abp.FeatureManagement.EntityFrameworkCore (10.6.1), Volo.Abp.Identity.EntityFrameworkCore (10.6.1), Volo.Abp.OpenIddict.EntityFrameworkCore (10.6.1), Volo.Abp.PermissionManagement.EntityFrameworkCore (10.6.1) (+4 more)

### Community 81 - "Domain Layer NuGet Dependencies"
Cohesion: 0.15
Nodes (12): Volo.Abp.AuditLogging.Domain (10.6.1), Volo.Abp.BackgroundJobs.Domain (10.6.1), Volo.Abp.Emailing (10.6.1), Volo.Abp.FeatureManagement.Domain (10.6.1), Volo.Abp.Identity.Domain (10.6.1), Volo.Abp.OpenIddict.Domain (10.6.1), Volo.Abp.PermissionManagement.Domain.Identity (10.6.1), Volo.Abp.PermissionManagement.Domain.OpenIddict (10.6.1) (+4 more)

### Community 82 - "Admin Controller & Login DTOs"
Cohesion: 0.21
Nodes (4): AdminController, LoginRequest, Password, UserName

### Community 83 - "Permission & Branding Definitions"
Cohesion: 0.17
Nodes (4): MediFlowPermissionDefinitionProvider, MediFlowResource, MediFlowBrandingProvider, AppName

### Community 84 - "Domain Shared NuGet Dependencies"
Cohesion: 0.17
Nodes (11): Microsoft.Extensions.FileProviders.Embedded (10.0.9), Volo.Abp.AuditLogging.Domain.Shared (10.6.1), Volo.Abp.BackgroundJobs.Domain.Shared (10.6.1), Volo.Abp.FeatureManagement.Domain.Shared (10.6.1), Volo.Abp.Identity.Domain.Shared (10.6.1), Volo.Abp.OpenIddict.Domain.Shared (10.6.1), Volo.Abp.PermissionManagement.Domain.Shared (10.6.1), Volo.Abp.SettingManagement.Domain.Shared (10.6.1) (+3 more)

### Community 86 - "Frontend Utility Functions (Minified)"
Cohesion: 0.29
Nodes (10): cq(), getUri(), nZ(), sX(), a(), c(), i(), o() (+2 more)

### Community 87 - "User Management Modal & Role Filters"
Cohesion: 0.24
Nodes (8): CreateUserModal(), CreateUserModalProps, RoleOption, roleOptions, ROLE_FILTERS, ROLE_META, UserDto, UserManagementPage()

### Community 88 - "Application Contracts NuGet Dependencies"
Cohesion: 0.20
Nodes (9): Volo.Abp.Account.Application.Contracts (10.6.1), Volo.Abp.FeatureManagement.Application.Contracts (10.6.1), Volo.Abp.Identity.Application.Contracts (10.6.1), Volo.Abp.ObjectExtending (10.6.1), Volo.Abp.PermissionManagement.Application.Contracts (10.6.1), Volo.Abp.SettingManagement.Application.Contracts (10.6.1), Volo.Abp.TenantManagement.Application.Contracts (10.6.1), net10.0 (+1 more)

### Community 89 - "User Update Input DTOs"
Cohesion: 0.20
Nodes (10): UpdateUserInput, Address, Email, Name, Password, PhoneNumber, RoleName, Surname (+2 more)

### Community 90 - "Settings Configuration"
Cohesion: 0.22
Nodes (3): MediFlow.Settings, MediFlowSettingDefinitionProvider, MediFlowSettings

### Community 91 - "Docker Compose Services Config"
Cohesion: 0.22
Nodes (8): services, version, volumes, postgres_data, x-common-db-config, image, restart, volumes

### Community 92 - "Docker Compose Database Config"
Cohesion: 0.28
Nodes (9): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, environment, image, restart, volumes, mediflow-db (+1 more)

### Community 93 - "Frontend Type Definitions (Drug, Invoice, Pharmacy, etc.)"
Cohesion: 0.22
Nodes (8): Drug, Invoice, InvoiceItem, Pharmacy, ReturnData, ReturnItem, ReturnList(), Shipment

### Community 94 - "Serilog & Logging Dependencies"
Cohesion: 0.22
Nodes (8): Serilog.Extensions.Logging (9.0.2), Serilog.Sinks.Console (6.0.0), Serilog.Sinks.File (7.0.0), net10.0, Microsoft.Extensions.Hosting (10.0.9), Serilog.Sinks.Async (2.1.0), Volo.Abp.Autofac (10.6.1), Microsoft.NET.Sdk

### Community 95 - "HTTP API NuGet Dependencies"
Cohesion: 0.22
Nodes (8): Volo.Abp.Account.HttpApi (10.6.1), Volo.Abp.FeatureManagement.HttpApi (10.6.1), Volo.Abp.Identity.HttpApi (10.6.1), Volo.Abp.PermissionManagement.HttpApi (10.6.1), Volo.Abp.SettingManagement.HttpApi (10.6.1), Volo.Abp.TenantManagement.HttpApi (10.6.1), net10.0, Microsoft.NET.Sdk

### Community 96 - "User Creation DTOs (Duplicate)"
Cohesion: 0.22
Nodes (9): CreateUserDtoDto, Address, Email, Name, Password, PhoneNumber, RoleName, Surname (+1 more)

### Community 97 - "Docker Compose Backend Service"
Cohesion: 0.25
Nodes (8): mediflow-db, depends_on, environment, ports, restart, condition, mediflow-backend, depends_on

### Community 98 - "Core Domain Entities (Customer, Drug, Pharmacy, Sale, StockBatch)"
Cohesion: 0.25
Nodes (7): Customer, Drug, Pharmacy, Prescription, Sale, SaleItem, StockBatch

### Community 99 - "Drug Form Enum"
Cohesion: 0.25
Nodes (7): DrugForm, Capsule, Drops, Injection, Ointment, Syrup, Tablet

### Community 100 - "Prescription Type Enum"
Cohesion: 0.25
Nodes (7): PrescriptionType, Green, Orange, OverTheCounter, Purple, Red, White

### Community 101 - "Inventory Domain Entities (Drug, StockBatch, StockMovementLog, Supplier, Warehouse)"
Cohesion: 0.29
Nodes (6): Drug, DrugSummary, StockBatch, StockMovementLog, Supplier, Warehouse

### Community 102 - "Logistics Domain Entities (Order, Shipment, Pharmacy)"
Cohesion: 0.29
Nodes (6): Drug, Order, OrderItem, Pharmacy, Shipment, ShipmentItem

### Community 103 - "Frontend LeptonX Theme Package"
Cohesion: 0.33
Nodes (6): @abp/aspnetcore.mvc.ui.theme.leptonxlite, dependencies, @abp/aspnetcore.mvc.ui.theme.leptonxlite@~5.6.1, name, private, version

### Community 104 - "Price Validation Result DTO"
Cohesion: 0.29
Nodes (7): PriceValidationResult, IsCoveredByStateInsurance, IsValid, Message, OfficialPrice, OfficialTaxRate, StateCoveragePercentage

### Community 105 - "Invoice Status Enum"
Cohesion: 0.29
Nodes (6): InvoiceStatus, Cancelled, Draft, Issued, Overdue, Paid

### Community 106 - "Docker Build Context"
Cohesion: 0.53
Nodes (6): context, dockerfile, build, build, build, build

### Community 107 - "Docker Health Check Config"
Cohesion: 0.53
Nodes (6): interval, retries, test, timeout, healthcheck, healthcheck

### Community 109 - "Minified Frontend Functions"
Cohesion: 0.60
Nodes (6): cY(), f(), h(), m(), p(), oY()

### Community 110 - "Minified Frontend Functions"
Cohesion: 0.47
Nodes (6): gj(), h(), m(), o(), p(), WJ()

### Community 111 - "ESLint Configuration"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 112 - "Stock Batch Status Enum"
Cohesion: 0.33
Nodes (5): StockBatchStatus, Active, Expired, Quarantine, Recalled

### Community 115 - "Test Model"
Cohesion: 0.40
Nodes (4): MediFlow.Models.Test, TestModel, BirthDate, Name

### Community 116 - "Docker Compose Frontend Service"
Cohesion: 0.40
Nodes (5): depends_on, environment, ports, restart, mediflow-frontend

### Community 117 - "Docker Compose Frontend Common Config"
Cohesion: 0.40
Nodes (5): x-common-frontend-config, depends_on, environment, ports, restart

### Community 118 - "Docker Compose Backend Common Config"
Cohesion: 0.50
Nodes (4): x-common-backend-config, environment, ports, restart

### Community 119 - "Minified Functions"
Cohesion: 0.83
Nodes (4): dC(), f(), g(), p()

### Community 120 - "Minified Functions"
Cohesion: 1.00
Nodes (4): mV(), n(), r(), t()

### Community 121 - "Minified Functions"
Cohesion: 0.67
Nodes (3): qh(), n(), t()

## Knowledge Gaps
- **797 isolated node(s):** `IdentityNumber`, `FirstName`, `LastName`, `PhoneNumber`, `DateOfBirth` (+792 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1342 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediFlowDbContext` connect `EF Core DbContext & Entity Sets` to `Domain Module References (Sales, Payment, Drugs, etc.)`, `Sales DTOs & Contracts (CreateUpdateSaleDto, SaleDto)`, `Drug Ingredient DTOs & Shipment Items`, `Database Migration & Seed Services`, `Invoice & Return Services with Price Validation`, `Order DTOs & Contracts`, `Stock Batch DTOs & Contracts`, `Stock Movement Log DTOs & Contracts`, `Shipment DTOs & Contracts`, `Order Item DTOs & Contracts`, `Return Item DTOs & Contracts`, `Payment Method DTOs & Contracts`, `Pharmacy DTOs & Contracts`, `Drug Price History DTOs & Contracts`, `Supplier DTOs & Contracts`, `Return DTOs & Contracts`, `Customer DTOs & Contracts`, `Ingredient DTOs & Contracts`, `Prescription DTOs & Contracts`, `Payment Entity Configuration & Status Enum`, `Pharmacy Stock DTOs & Contracts`, `Warehouse DTOs & Contracts`, `Sale Item DTOs & Contracts`, `EF Core Module Configuration`, `Entity Framework Core Test Modules`, `Invoice Item DTOs & Mappers`, `Invoice DTOs & Mappers`, `Drug Mappers`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 165 inferred relationships involving `t()` (e.g. with `r()` and `Ai()`) actually correct?**
  _`t()` has 165 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IdentityNumber`, `FirstName`, `LastName` to the rest of the system?**
  _797 weakly-connected nodes found - possible missing edges._
- **Should `Frontend Build Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.011720158672917418 - nodes in this community are weakly interconnected._
- **Why does `Drug` connect `Drug Mappers` to `Order Item DTOs & Contracts`, `Backend Controllers & Seed Data`, `Dashboard DTOs & Filters`, `Drug Form Enum`, `Drug DTOs & Create/Update`, `Drug DTOs (Read)`, `Prescription Type Enum`, `Domain Module References (Sales, Payment, Drugs, etc.)`, `Customer DTOs & Contracts`, `Ingredient DTOs & Contracts`, `EF Core DbContext & Entity Sets`, `Invoice & Return Services with Price Validation`, `Stock Batch DTOs & Contracts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 147 inferred relationships involving `n()` (e.g. with `r()` and `r()`) actually correct?**
  _`n()` has 147 INFERRED edges - model-reasoned connections that need verification._
- **Should `Backend Controllers & Seed Data` be split into smaller, more focused modules?**
  _Cohesion score 0.03308172584102134 - nodes in this community are weakly interconnected._