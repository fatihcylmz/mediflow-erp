# Graph Report - aspnet-core  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2015 nodes · 4224 edges · 117 communities (103 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.84)
- Token cost: 46,524 input · 3,331 output

## Community Hubs (Navigation)
- Data Access Layer
- Application Initialization
- Business Domain Modules
- Docker Infrastructure
- Database Context & Identity
- HTTP API Controllers
- ABP Framework Configuration
- Supply Chain Entities
- Stock Batch Management
- Shipment Processing
- Return Items
- User Management UI
- Payment Services
- Localization & Permissions
- Order Management
- Pharmacy Management
- Return Management
- Stock Movement Logging
- Supplier Management
- Prescription Management
- Order Item Management
- Pharmacy Stock Management
- Sale Management
- Unit Testing Setup
- Frontend Dependencies
- Drug Ingredient Management
- Customer Management
- Database Migration Tools
- Background Services
- ABP Module Configuration
- Base CRUD Services
- Ingredient Catalog
- Auth Controller Base
- Sale Items
- Invoice Processing
- Database Migrations
- Shipment Items
- Integration Testing
- EF Core Model Building
- Frontend Layouts
- Main Application Pages
- TypeScript Configuration
- Entity List Pages
- Drug Price History
- Authentication Flow
- Global Configuration
- Drug & Ingredient Domain
- Multi-Tenancy & API Config
- Invoice Items
- Node TypeScript Config
- Drug Properties
- Drug DTOs
- Frontend Dependencies
- Module Extension Configuration
- Create User Forms
- Create User Form Variant
- User Role Management
- Invoice Summaries
- Permission System
- Invoice Operations
- Drug Entity
- Order Domain Module
- Host Project Dependencies
- HTTP Client Dependencies
- Test Dependencies
- Solution Configuration
- React App Hooks
- EF Core Dependencies
- Domain Module Dependencies
- Price History DTOs
- Payment Entity Configuration
- Domain Shared Definitions
- Payment Transactions
- Security Principal Handling
- Settings Configuration
- Docker Services
- Database Environment
- Ingredient DTOs
- User Creation Modal
- Create User Form
- Docker Health Checks
- Return List View
- Sale List View
- Application Services
- Application Contracts
- Drug Form Types
- Prescription Types
- Inventory Dashboard
- Shipment Tracking
- Logging Configuration
- HTTP API Layer
- Backend Package Config
- Payment Methods
- Invoice Statuses
- User Update Inputs
- Pricing Domain Module
- Prescription Domain Module
- Docker Build Config
- Health Check Config
- Lint Rules Config
- User Profile Updates
- Payment Status Enums
- Stock Batch Status
- Test Models
- Frontend Container Setup
- Shared Frontend Config
- DbContext Factory
- Payment Application Service
- Backend Container Config
- Pharmacy Listings
- Application Configuration
- TypeScript Config
- User Role Assignment

## God Nodes (most connected - your core abstractions)
1. `MediFlowDbContext` - 82 edges
2. `Invoice` - 32 edges
3. `UserDto` - 27 edges
4. `@ant-design/icons` - 27 edges
5. `antd` - 27 edges
6. `Drug` - 26 edges
7. `InvoiceDto` - 25 edges
8. `react` - 25 edges
9. `StockBatch` - 24 edges
10. `MediFlow` - 24 edges

## Surprising Connections (you probably didn't know these)
- `MediFlow.HttpApi.Client.ConsoleTestApp` --references--> `net10.0`  [EXTRACTED]
  test/MediFlow.HttpApi.Client.ConsoleTestApp/MediFlow.HttpApi.Client.ConsoleTestApp.csproj → src/MediFlow.Domain/MediFlow.Domain.csproj
- `MediFlow.HttpApi.Client.ConsoleTestApp` --references--> `Microsoft.NET.Sdk`  [EXTRACTED]
  test/MediFlow.HttpApi.Client.ConsoleTestApp/MediFlow.HttpApi.Client.ConsoleTestApp.csproj → src/MediFlow.Domain/MediFlow.Domain.csproj
- `MediFlow.TestBase` --references--> `net10.0`  [EXTRACTED]
  test/MediFlow.TestBase/MediFlow.TestBase.csproj → src/MediFlow.Domain/MediFlow.Domain.csproj
- `MediFlow.TestBase` --references--> `Microsoft.NET.Sdk`  [EXTRACTED]
  test/MediFlow.TestBase/MediFlow.TestBase.csproj → src/MediFlow.Domain/MediFlow.Domain.csproj
- `MediFlow.Application.Tests` --references--> `net10.0`  [EXTRACTED]
  test/MediFlow.Application.Tests/MediFlow.Application.Tests.csproj → src/MediFlow.Domain/MediFlow.Domain.csproj

## Import Cycles
- None detected.

## Communities (117 total, 14 thin omitted)

### Community 0 - "Data Access Layer"
Cohesion: 0.07
Nodes (8): MediFlow.EntityFrameworkCore, MediFlow.Migrations, MediFlow.Data, MediFlow.OpenIddict, MediFlowDbContextModelSnapshot, MediFlowEntityFrameworkCoreCollection, MediFlowEntityFrameworkCoreCollectionFixtureBase, MediFlowEntityFrameworkCoreFixture

### Community 1 - "Application Initialization"
Cohesion: 0.05
Nodes (10): IMediFlowDbSchemaMigrator, MediFlowDbMigrationService, Logger, NullMediFlowDbSchemaMigrator, OpenIddictDataSeedContributor, EntityFrameworkCoreMediFlowDbSchemaMigrator, MediFlowBrandingProvider, AppName (+2 more)

### Community 2 - "Business Domain Modules"
Cohesion: 0.08
Nodes (5): MediFlow.Shipments, MediFlow.Invoices, MediFlow.Payment, MediFlow.Inventories, MediFlow.Returns

### Community 3 - "Docker Infrastructure"
Cohesion: 0.05
Nodes (47): context, dockerfile, mediflow-db, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+39 more)

### Community 4 - "Database Context & Identity"
Cohesion: 0.04
Nodes (35): MediFlowDbContext, ClaimTypes, Customers, DrugIngredients, DrugPriceHistories, Drugs, Ingredients, InvoiceItems (+27 more)

### Community 5 - "HTTP API Controllers"
Cohesion: 0.10
Nodes (7): MediFlow.Users, MediFlow.HttpApi.Controllers, MediFlow.EntityFrameworkCore.Samples, MediFlow.Controllers, MediFlowController, GetUsersByRoleInput, RoleName

### Community 6 - "ABP Framework Configuration"
Cohesion: 0.08
Nodes (7): MediFlowApplicationContractsModule, MediFlowApplicationModule, MediFlowDomainModule, MediFlowHttpApiClientModule, MediFlowHttpApiHostModule, MediFlowDomainTestModule, MediFlowTestBaseModule

### Community 7 - "Supply Chain Entities"
Cohesion: 0.11
Nodes (5): MediFlow.Sales, MediFlow.Pharmacies, MediFlow.Warehouses, MediFlow.Suppliers, MediFlow.Customers

### Community 8 - "Stock Batch Management"
Cohesion: 0.07
Nodes (34): CreateUpdateStockBatchDto, DrugId, ExpirationDate, IsQuarantined, LotNumber, Quantity, ReservedQuantity, ShelfLocation (+26 more)

### Community 9 - "Shipment Processing"
Cohesion: 0.08
Nodes (30): CreateUpdateShipmentDto, DeliveryDate, OrderId, PharmacyId, ShipmentDate, Status, TrackingNumber, IShipmentAppService (+22 more)

### Community 10 - "Return Items"
Cohesion: 0.07
Nodes (30): CreateUpdateReturnItemDto, DrugId, LineTotal, Quantity, Reason, ReturnId, StockBatchId, TaxRate (+22 more)

### Community 11 - "User Management UI"
Cohesion: 0.13
Nodes (16): IUserManagementAppService, UserDto, Address, Email, Id, IsActive, Name, PhoneNumber (+8 more)

### Community 12 - "Payment Services"
Cohesion: 0.09
Nodes (17): IPaymentAppService, CreateUpdatePaymentMethodDto, Code, Description, FeePercentage, IsActive, Name, RequiresApproval (+9 more)

### Community 13 - "Localization & Permissions"
Cohesion: 0.11
Nodes (4): MediFlow.Localization, MediFlow.Permissions, MediFlow.Application.Services, MediFlowPermissions

### Community 14 - "Order Management"
Cohesion: 0.09
Nodes (27): CreateUpdateOrderDto, Notes, OrderDate, OrderNumber, PharmacyId, Status, IOrderAppService, OrderDto (+19 more)

### Community 15 - "Pharmacy Management"
Cohesion: 0.08
Nodes (28): CreateUpdatePharmacyDto, Address, GLN, Name, PharmacistLicenseNumber, PharmacistName, PhoneNumber, TaxNumber (+20 more)

### Community 16 - "Return Management"
Cohesion: 0.09
Nodes (27): CreateUpdateReturnDto, InvoiceId, PharmacyId, ReturnDate, Status, TrackingNumber, IReturnAppService, ReturnDto (+19 more)

### Community 17 - "Stock Movement Logging"
Cohesion: 0.08
Nodes (26): CreateUpdateStockMovementLogDto, Description, MovementType, QuantityChange, ReferenceId, StockBatchId, StockMovementLogDto, Description (+18 more)

### Community 18 - "Supplier Management"
Cohesion: 0.09
Nodes (25): CreateUpdateSupplierDto, ContactName, ContactSurname, Email, Name, PhoneNumber, TaxNumber, ISupplierAppService (+17 more)

### Community 19 - "Prescription Management"
Cohesion: 0.09
Nodes (25): CreateUpdatePrescriptionDto, CustomerId, DoctorDiplomaNumber, DoctorName, EPrescriptionNumber, HospitalName, IssueDate, IPrescriptionAppService (+17 more)

### Community 20 - "Order Item Management"
Cohesion: 0.12
Nodes (19): CreateUpdateOrderItemDto, ApprovedQuantity, DrugId, OrderId, RequestedQuantity, IOrderItemAppService, OrderItemDto, ApprovedQuantity (+11 more)

### Community 21 - "Pharmacy Stock Management"
Cohesion: 0.11
Nodes (22): CreateUpdatePharmacyStockDto, DrugId, ExpirationDate, LotNumber, PharmacyId, Quantity, IPharmacyStockAppService, PharmacyStockDto (+14 more)

### Community 22 - "Sale Management"
Cohesion: 0.11
Nodes (22): CreateUpdateSaleDto, CustomerId, PharmacyId, PrescriptionId, SaleDate, TotalAmount, ISaleAppService, SaleDto (+14 more)

### Community 23 - "Unit Testing Setup"
Cohesion: 0.10
Nodes (8): MediFlow.Samples, MediFlow.EntityFrameworkCore.Applications, MediFlow.EntityFrameworkCore.Domains, MediFlowApplicationTestBase, SampleAppServiceTests, EfCoreSampleAppServiceTests, EfCoreSampleDomainTests, MediFlowEntityFrameworkCoreTestModule

### Community 24 - "Frontend Dependencies"
Cohesion: 0.10
Nodes (24): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.8, @vitejs/plugin-react@^6.1.1 (+16 more)

### Community 25 - "Drug Ingredient Management"
Cohesion: 0.12
Nodes (19): CreateUpdateDrugIngredientDto, Amount, DrugId, IngredientId, Unit, DrugIngredientDto, Amount, DrugId (+11 more)

### Community 26 - "Customer Management"
Cohesion: 0.11
Nodes (20): CreateUpdateCustomerDto, DateOfBirth, FirstName, IdentityNumber, LastName, PhoneNumber, CustomerDto, DateOfBirth (+12 more)

### Community 27 - "Database Migration Tools"
Cohesion: 0.14
Nodes (3): MediFlow.HttpApi.Client.ConsoleTestApp, MediFlow.DbMigrator, Program

### Community 28 - "Background Services"
Cohesion: 0.13
Nodes (19): CreateUpdateWarehouseDto, HasColdStorage, LocationAddress, ManagerName, Name, IWarehouseAppService, WarehouseDto, HasColdStorage (+11 more)

### Community 29 - "ABP Module Configuration"
Cohesion: 0.12
Nodes (6): DbMigratorHostedService, MediFlowDbMigratorModule, Program, ConsoleTestAppHostedService, MediFlowConsoleApiClientModule, Program

### Community 30 - "Base CRUD Services"
Cohesion: 0.16
Nodes (13): ICustomerAppService, IDrugAppService, IStockMovementLogAppService, IInvoiceAppService, IDrugPriceHistoryAppService, IReturnItemAppService, ISaleItemAppService, CustomerAppService (+5 more)

### Community 31 - "Ingredient Catalog"
Cohesion: 0.12
Nodes (17): CreateUpdateIngredientDto, Description, Name, Type, IIngredientAppService, IngredientAppService, CreateUpdateIngredientDtoToIngredientMapper, Ingredient (+9 more)

### Community 32 - "Auth Controller Base"
Cohesion: 0.13
Nodes (4): UserInitializationService, AdminController, MediFlowDomainTestBase, SampleDomainTests

### Community 33 - "Sale Items"
Cohesion: 0.13
Nodes (17): CreateUpdateSaleItemDto, Quantity, SaleId, StockBatchId, UnitPrice, SaleItemDto, Quantity, SaleId (+9 more)

### Community 34 - "Invoice Processing"
Cohesion: 0.11
Nodes (12): InvoiceAppService, Invoice, DueDate, GrandTotal, InvoiceNumber, IssueDate, Items, PharmacyId (+4 more)

### Community 35 - "Database Migrations"
Cohesion: 0.14
Nodes (6): AddOrderIdToShipment, Update_Drug_Schema_And_Relations, Add_SupplierId_To_StockBatch, UpdateReturnAndReturnItemSchema, Add_InvoiceId_To_Returns, Added_Payment_Methods_And_Transactions

### Community 36 - "Shipment Items"
Cohesion: 0.15
Nodes (16): CreateUpdateShipmentItemDto, Quantity, ShipmentId, StockBatchId, IShipmentItemAppService, ShipmentItemDto, Quantity, ShipmentId (+8 more)

### Community 37 - "Integration Testing"
Cohesion: 0.15
Nodes (3): MediFlowEntityFrameworkCoreTestBase, SampleRepositoryTests, MediFlowTestBase

### Community 38 - "EF Core Model Building"
Cohesion: 0.26
Nodes (4): Added_Pharma_Modules, AddInvoiceItems, DeleteUserInput, UserId

### Community 39 - "Frontend Layouts"
Cohesion: 0.15
Nodes (5): react-router-dom@^7.18.4, Warehouse, @ant-design/icons, antd, react-router-dom

### Community 40 - "Main Application Pages"
Cohesion: 0.18
Nodes (16): App(), UserManagementPage(), DrugList(), DrugPriceHistoryList(), Ingredient, IngredientList(), InventoryList(), InvoiceList() (+8 more)

### Community 41 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 42 - "Entity List Pages"
Cohesion: 0.15
Nodes (11): Drug, DrugPriceHistory, Drug, Order, OrderItem, Pharmacy, StockBatch, Customer (+3 more)

### Community 43 - "Drug Price History"
Cohesion: 0.13
Nodes (17): CreateUpdateDrugPriceHistoryDto, DrugId, IsCoveredByStateInsurance, Price, StateCoveragePercentage, TaxRate, ValidFrom, ValidTo (+9 more)

### Community 44 - "Authentication Flow"
Cohesion: 0.12
Nodes (13): AuthController, LoginRequestDto, Password, Username, LoginResponseDto, AccessToken, AccessTokenRoles, Email (+5 more)

### Community 45 - "Global Configuration"
Cohesion: 0.14
Nodes (5): MediFlow, MediFlowConsts, MediFlowDomainErrorCodes, MediFlowApplicationTestModule, MediFlowTestConsts

### Community 48 - "Invoice Items"
Cohesion: 0.14
Nodes (15): InvoiceItemDto, DrugId, LineTotal, Quantity, TaxRate, UnitPrice, InvoiceItemToInvoiceItemDtoMapper, InvoiceItem (+7 more)

### Community 49 - "Node TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 50 - "Drug Properties"
Cohesion: 0.14
Nodes (14): CreateUpdateDrugDto, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel, Name (+6 more)

### Community 51 - "Drug DTOs"
Cohesion: 0.14
Nodes (14): DrugDto, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel, Name (+6 more)

### Community 52 - "Frontend Dependencies"
Cohesion: 0.13
Nodes (14): dependencies, @ant-design/icons@^6.3.4, antd@^6.6.5, axios@^1.20.0, qrcode.react@^4.2.0, react@^19.2.8, react-dom@^19.2.8, Drug (+6 more)

### Community 53 - "Module Extension Configuration"
Cohesion: 0.18
Nodes (6): MediFlowDtoExtensions, MediFlowDomainSharedModule, MediFlowGlobalFeatureConfigurator, MediFlowModuleExtensionConfigurator, MediFlowEfCoreEntityExtensionMappings, MediFlowEntityFrameworkCoreModule

### Community 54 - "Create User Forms"
Cohesion: 0.13
Nodes (15): CreateUserDto, Address, Email, Name, Password, PharmacyGln, PharmacyName, PhoneNumber (+7 more)

### Community 55 - "Create User Form Variant"
Cohesion: 0.13
Nodes (15): CreateUserDtoDto, Address, Email, Name, Password, PhoneNumber, RoleName, Surname (+7 more)

### Community 56 - "User Role Management"
Cohesion: 0.25
Nodes (4): MediFlowRoles, UserManagementAppService, MediFlowUser, Address

### Community 57 - "Invoice Summaries"
Cohesion: 0.16
Nodes (12): InvoiceDto, DueDate, GrandTotal, InvoiceNumber, IssuedDate, Items, PharmacyId, ShipmentId (+4 more)

### Community 58 - "Permission System"
Cohesion: 0.18
Nodes (3): MediFlowPermissionDefinitionProvider, MediFlowResource, MediFlowHttpApiModule

### Community 59 - "Invoice Operations"
Cohesion: 0.18
Nodes (11): CreateUpdateInvoiceDto, DueDate, GrandTotal, InvoiceNumber, IssuedDate, PharmacyId, ShipmentId, Status (+3 more)

### Community 60 - "Drug Entity"
Cohesion: 0.15
Nodes (13): Drug, ATCCode, Barcode, Dosage, DosageUnit, Form, MinimumStockLevel, Name (+5 more)

### Community 62 - "Host Project Dependencies"
Cohesion: 0.17
Nodes (12): Microsoft.EntityFrameworkCore.Design (10.0.14), Serilog.AspNetCore (9.0.0), Volo.Abp.Account.Web.OpenIddict (10.6.1), Volo.Abp.AspNetCore.MultiTenancy (10.6.1), Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite (5.4.0-preview*), Volo.Abp.AspNetCore.Serilog (10.6.1), Volo.Abp.Swashbuckle (10.6.1), Microsoft.NET.Sdk.Web (+4 more)

### Community 63 - "HTTP Client Dependencies"
Cohesion: 0.17
Nodes (12): Microsoft.Extensions.Http.Polly (10.0.9), Volo.Abp.Account.HttpApi.Client (10.6.1), Volo.Abp.FeatureManagement.HttpApi.Client (10.6.1), Volo.Abp.Http.Client.IdentityModel (10.6.1), Volo.Abp.Identity.HttpApi.Client (10.6.1), Volo.Abp.PermissionManagement.HttpApi.Client (10.6.1), Volo.Abp.SettingManagement.HttpApi.Client (10.6.1), Volo.Abp.TenantManagement.HttpApi.Client (10.6.1) (+4 more)

### Community 64 - "Test Dependencies"
Cohesion: 0.17
Nodes (12): NSubstitute (5.3.0), NSubstitute.Analyzers.CSharp (1.0.17), Shouldly (4.3.0), Volo.Abp.Authorization (10.6.1), Volo.Abp.BackgroundJobs.Abstractions (10.6.1), Volo.Abp.TestBase (10.6.1), xunit (2.9.3), xunit.extensibility.execution (2.9.3) (+4 more)

### Community 65 - "Solution Configuration"
Cohesion: 0.29
Nodes (10): Volo.Abp.EntityFrameworkCore.Sqlite (10.6.1), net10.0, Microsoft.NET.Sdk, MediFlow.Application.Tests, Microsoft.NET.Test.Sdk (17.14.1), MediFlow.Domain.Tests, Microsoft.NET.Test.Sdk (17.14.1), MediFlow.EntityFrameworkCore.Tests (+2 more)

### Community 66 - "React App Hooks"
Cohesion: 0.18
Nodes (5): AppServiceContext, Drug, DrugIngredient, Ingredient, react

### Community 67 - "EF Core Dependencies"
Cohesion: 0.18
Nodes (11): Microsoft.EntityFrameworkCore.Tools (10.0.9), Volo.Abp.AuditLogging.EntityFrameworkCore (10.6.1), Volo.Abp.BackgroundJobs.EntityFrameworkCore (10.6.1), Volo.Abp.EntityFrameworkCore.PostgreSql (10.6.1), Volo.Abp.FeatureManagement.EntityFrameworkCore (10.6.1), Volo.Abp.Identity.EntityFrameworkCore (10.6.1), Volo.Abp.OpenIddict.EntityFrameworkCore (10.6.1), Volo.Abp.PermissionManagement.EntityFrameworkCore (10.6.1) (+3 more)

### Community 68 - "Domain Module Dependencies"
Cohesion: 0.18
Nodes (11): Volo.Abp.AuditLogging.Domain (10.6.1), Volo.Abp.BackgroundJobs.Domain (10.6.1), Volo.Abp.Emailing (10.6.1), Volo.Abp.FeatureManagement.Domain (10.6.1), Volo.Abp.Identity.Domain (10.6.1), Volo.Abp.OpenIddict.Domain (10.6.1), Volo.Abp.PermissionManagement.Domain.Identity (10.6.1), Volo.Abp.PermissionManagement.Domain.OpenIddict (10.6.1) (+3 more)

### Community 69 - "Price History DTOs"
Cohesion: 0.22
Nodes (9): DrugPriceHistoryDto, DrugId, IsCoveredByStateInsurance, Price, StateCoveragePercentage, TaxRate, ValidFrom, ValidTo (+1 more)

### Community 70 - "Payment Entity Configuration"
Cohesion: 0.27
Nodes (3): MediFlow.EntityFrameworkCore.EntityConfigurations.Payment, PaymentConfiguration, PaymentMethodConfiguration

### Community 71 - "Domain Shared Definitions"
Cohesion: 0.20
Nodes (10): Microsoft.Extensions.FileProviders.Embedded (10.0.9), Volo.Abp.AuditLogging.Domain.Shared (10.6.1), Volo.Abp.BackgroundJobs.Domain.Shared (10.6.1), Volo.Abp.FeatureManagement.Domain.Shared (10.6.1), Volo.Abp.Identity.Domain.Shared (10.6.1), Volo.Abp.OpenIddict.Domain.Shared (10.6.1), Volo.Abp.PermissionManagement.Domain.Shared (10.6.1), Volo.Abp.SettingManagement.Domain.Shared (10.6.1) (+2 more)

### Community 72 - "Payment Transactions"
Cohesion: 0.20
Nodes (10): PaymentTransaction, Amount, Invoice, InvoiceId, Notes, PaymentDate, PaymentMethod, PaymentMethodId (+2 more)

### Community 74 - "Settings Configuration"
Cohesion: 0.22
Nodes (3): MediFlow.Settings, MediFlowSettingDefinitionProvider, MediFlowSettings

### Community 75 - "Docker Services"
Cohesion: 0.22
Nodes (8): services, version, volumes, postgres_data, x-common-db-config, image, restart, volumes

### Community 76 - "Database Environment"
Cohesion: 0.28
Nodes (9): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, environment, image, restart, volumes, mediflow-db (+1 more)

### Community 77 - "Ingredient DTOs"
Cohesion: 0.31
Nodes (5): IngredientDto, Description, Name, Type, IngredientToIngredientDtoMapper

### Community 78 - "User Creation Modal"
Cohesion: 0.25
Nodes (7): CreateUserModal(), CreateUserModalProps, RoleOption, roleOptions, ROLE_FILTERS, ROLE_META, UserDto

### Community 79 - "Create User Form"
Cohesion: 0.22
Nodes (9): CreateUserDtoDto, Address, Email, Name, Password, PhoneNumber, RoleName, Surname (+1 more)

### Community 80 - "Docker Health Checks"
Cohesion: 0.25
Nodes (8): mediflow-db, depends_on, environment, ports, restart, condition, mediflow-backend, depends_on

### Community 81 - "Return List View"
Cohesion: 0.25
Nodes (7): Drug, Invoice, InvoiceItem, Pharmacy, ReturnData, ReturnItem, Shipment

### Community 82 - "Sale List View"
Cohesion: 0.25
Nodes (7): Customer, Drug, Pharmacy, Prescription, Sale, SaleItem, StockBatch

### Community 83 - "Application Services"
Cohesion: 0.25
Nodes (8): Volo.Abp.Account.Application (10.6.1), Volo.Abp.FeatureManagement.Application (10.6.1), Volo.Abp.Identity.Application (10.6.1), Volo.Abp.PermissionManagement.Application (10.6.1), Volo.Abp.SettingManagement.Application (10.6.1), Volo.Abp.TenantManagement.Application (10.6.1), Volo.Abp.Uow (10.7.1), MediFlow.Application

### Community 84 - "Application Contracts"
Cohesion: 0.25
Nodes (8): Volo.Abp.Account.Application.Contracts (10.6.1), Volo.Abp.FeatureManagement.Application.Contracts (10.6.1), Volo.Abp.Identity.Application.Contracts (10.6.1), Volo.Abp.ObjectExtending (10.6.1), Volo.Abp.PermissionManagement.Application.Contracts (10.6.1), Volo.Abp.SettingManagement.Application.Contracts (10.6.1), Volo.Abp.TenantManagement.Application.Contracts (10.6.1), MediFlow.Application.Contracts

### Community 85 - "Drug Form Types"
Cohesion: 0.25
Nodes (7): DrugForm, Capsule, Drops, Injection, Ointment, Syrup, Tablet

### Community 86 - "Prescription Types"
Cohesion: 0.25
Nodes (7): PrescriptionType, Green, Orange, OverTheCounter, Purple, Red, White

### Community 87 - "Inventory Dashboard"
Cohesion: 0.29
Nodes (6): Drug, DrugSummary, StockBatch, StockMovementLog, Supplier, Warehouse

### Community 88 - "Shipment Tracking"
Cohesion: 0.29
Nodes (6): Drug, Order, OrderItem, Pharmacy, Shipment, ShipmentItem

### Community 89 - "Logging Configuration"
Cohesion: 0.29
Nodes (7): Serilog.Extensions.Logging (9.0.2), Serilog.Sinks.Console (6.0.0), Serilog.Sinks.File (7.0.0), MediFlow.DbMigrator, Microsoft.Extensions.Hosting (10.0.9), Serilog.Sinks.Async (2.1.0), Volo.Abp.Autofac (10.6.1)

### Community 90 - "HTTP API Layer"
Cohesion: 0.29
Nodes (7): Volo.Abp.Account.HttpApi (10.6.1), Volo.Abp.FeatureManagement.HttpApi (10.6.1), Volo.Abp.Identity.HttpApi (10.6.1), Volo.Abp.PermissionManagement.HttpApi (10.6.1), Volo.Abp.SettingManagement.HttpApi (10.6.1), Volo.Abp.TenantManagement.HttpApi (10.6.1), MediFlow.HttpApi

### Community 91 - "Backend Package Config"
Cohesion: 0.33
Nodes (6): @abp/aspnetcore.mvc.ui.theme.leptonxlite, dependencies, @abp/aspnetcore.mvc.ui.theme.leptonxlite@~5.6.1, name, private, version

### Community 92 - "Payment Methods"
Cohesion: 0.29
Nodes (7): PaymentMethod, Code, Description, FeePercentage, IsActive, Name, RequiresApproval

### Community 93 - "Invoice Statuses"
Cohesion: 0.29
Nodes (6): InvoiceStatus, Cancelled, Draft, Issued, Overdue, Paid

### Community 94 - "User Update Inputs"
Cohesion: 0.29
Nodes (7): UpdateUserInput, Address, Name, PhoneNumber, RoleName, Surname, UserId

### Community 98 - "Docker Build Config"
Cohesion: 0.53
Nodes (6): context, dockerfile, build, build, build, build

### Community 99 - "Health Check Config"
Cohesion: 0.53
Nodes (6): interval, retries, test, timeout, healthcheck, healthcheck

### Community 100 - "Lint Rules Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 101 - "User Profile Updates"
Cohesion: 0.33
Nodes (6): UpdateUserDto, Address, Name, PhoneNumber, RoleName, Surname

### Community 102 - "Payment Status Enums"
Cohesion: 0.33
Nodes (6): PaymentStatus, Cancelled, Completed, Failed, Pending, Refunded

### Community 103 - "Stock Batch Status"
Cohesion: 0.33
Nodes (5): StockBatchStatus, Active, Expired, Quarantine, Recalled

### Community 104 - "Test Models"
Cohesion: 0.40
Nodes (4): MediFlow.Models.Test, TestModel, BirthDate, Name

### Community 105 - "Frontend Container Setup"
Cohesion: 0.40
Nodes (5): depends_on, environment, ports, restart, mediflow-frontend

### Community 106 - "Shared Frontend Config"
Cohesion: 0.40
Nodes (5): x-common-frontend-config, depends_on, environment, ports, restart

### Community 109 - "Backend Container Config"
Cohesion: 0.50
Nodes (4): x-common-backend-config, environment, ports, restart

### Community 110 - "Pharmacy Listings"
Cohesion: 0.50
Nodes (3): Drug, Pharmacy, PharmacyStock

### Community 114 - "User Role Assignment"
Cohesion: 0.67
Nodes (3): SetUserRoleInput, RoleName, UserId

## Knowledge Gaps
- **657 isolated node(s):** `Logger`, `AppName`, `DrugId`, `LineTotal`, `Quantity` (+652 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 996 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `MediFlowDbContext` connect `Database Context & Identity` to `Data Access Layer`, `Application Initialization`, `Stock Batch Management`, `Shipment Processing`, `Return Items`, `Order Management`, `Pharmacy Management`, `Return Management`, `Stock Movement Logging`, `Supplier Management`, `Prescription Management`, `Order Item Management`, `Pharmacy Stock Management`, `Sale Management`, `Drug Ingredient Management`, `Customer Management`, `Background Services`, `Ingredient Catalog`, `Sale Items`, `Invoice Processing`, `Shipment Items`, `Integration Testing`, `Drug Price History`, `Invoice Items`, `Drug Entity`, `Payment Transactions`, `Payment Methods`, `Database Options`, `DbContext Factory`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `Logger`, `AppName`, `DrugId` to the rest of the system?**
  _657 weakly-connected nodes found - possible missing edges._
- **Should `Data Access Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.07086247086247087 - nodes in this community are weakly interconnected._
- **Why does `MediFlow` connect `Global Configuration` to `Data Access Layer`, `Auth Controller Base`, `Application Initialization`, `HTTP API Controllers`, `ABP Framework Configuration`, `Localization & Permissions`, `Drug & Ingredient Domain`, `Multi-Tenancy & API Config`, `App Service Base`, `Unit Testing Setup`, `Database Migration Tools`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Application Initialization` be split into smaller, more focused modules?**
  _Cohesion score 0.05075187969924812 - nodes in this community are weakly interconnected._
- **Why does `DrugDto` connect `Drug DTOs` to `EF Core Model Building`, `Ingredient DTOs`, `Drug & Ingredient Domain`, `Drug Form Types`, `Prescription Types`, `Base CRUD Services`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `Business Domain Modules` be split into smaller, more focused modules?**
  _Cohesion score 0.0783673469387755 - nodes in this community are weakly interconnected._