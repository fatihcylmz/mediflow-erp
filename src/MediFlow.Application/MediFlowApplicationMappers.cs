using Riok.Mapperly.Abstractions;
using Volo.Abp.ObjectMapping;
using MediFlow.Suppliers;
using Volo.Abp.Mapperly;
using MediFlow.Drugs;
using MediFlow.Ingredients;    
namespace MediFlow;
using MediFlow.Inventories;
using MediFlow.Warehouses;
using MediFlow.Invoices;
using MediFlow.Shipments;
using MediFlow.Pricing;
using MediFlow.Pharmacies;
using MediFlow.Customers;
using MediFlow.Orders;
using MediFlow.Sales;
using MediFlow.Returns;
using MediFlow.Prescriptions;
using MediFlow.Payment;
using MediFlow.Application.Contracts.Payment;
using Riok.Mapperly.Abstractions;



// 1. Veritabanından (Supplier) -> Kullanıcıya (SupplierDto) Giden Eşleştirme
[Mapper]
public partial class SupplierToSupplierDtoMapper : MapperBase<Supplier, SupplierDto>
{
    [MapperIgnoreSource(nameof(Supplier.IsDeleted))]
    [MapperIgnoreSource(nameof(Supplier.DeleterId))]
    [MapperIgnoreSource(nameof(Supplier.DeletionTime))]
    [MapperIgnoreSource(nameof(Supplier.ExtraProperties))]
    public override partial SupplierDto Map(Supplier source);

    // EKSİK OLAN 2. METOT (Sarı/Kırmızı Hatayı Çözen Kısım)
    [MapperIgnoreSource(nameof(Supplier.IsDeleted))]
    [MapperIgnoreSource(nameof(Supplier.DeleterId))]
    [MapperIgnoreSource(nameof(Supplier.DeletionTime))]
    [MapperIgnoreSource(nameof(Supplier.ExtraProperties))]
    public override partial void Map(Supplier source, SupplierDto destination);
}

// 2. Kullanıcıdan (CreateUpdateSupplierDto) -> Veritabanına (Supplier) Giden Eşleştirme
[Mapper]
public partial class CreateUpdateSupplierDtoToSupplierMapper : MapperBase<CreateUpdateSupplierDto, Supplier>
{
    public override partial Supplier Map(CreateUpdateSupplierDto source);

    // EKSİK OLAN 2. METOT (Sarı/Kırmızı Hatayı Çözen Kısım)
    public override partial void Map(CreateUpdateSupplierDto source, Supplier destination);
}
// Drug -> DrugDto
[Mapper]
public partial class DrugToDrugDtoMapper : MapperBase<Drug, DrugDto>
{
    [MapperIgnoreSource(nameof(Drug.ExtraProperties))]
    public override partial DrugDto Map(Drug source);

    [MapperIgnoreSource(nameof(Drug.ExtraProperties))]
    public override partial void Map(Drug source, DrugDto destination);
}

// CreateUpdateDrugDto -> Drug
[Mapper]
public partial class CreateUpdateDrugDtoToDrugMapper : MapperBase<CreateUpdateDrugDto, Drug>
{
    public override partial Drug Map(CreateUpdateDrugDto source);
    public override partial void Map(CreateUpdateDrugDto source, Drug destination);
}

// Ingredient -> IngredientDto
[Mapper]
public partial class IngredientToIngredientDtoMapper : MapperBase<Ingredient, IngredientDto>
{
    [MapperIgnoreSource(nameof(Ingredient.ExtraProperties))]
    [MapperIgnoreSource(nameof(Ingredient.ConcurrencyStamp))]
    public override partial IngredientDto Map(Ingredient source);

    [MapperIgnoreSource(nameof(Ingredient.ExtraProperties))]
    [MapperIgnoreSource(nameof(Ingredient.ConcurrencyStamp))]
    public override partial void Map(Ingredient source, IngredientDto destination);
}

// CreateUpdateIngredientDto -> Ingredient
[Mapper]
public partial class CreateUpdateIngredientDtoToIngredientMapper : MapperBase<CreateUpdateIngredientDto, Ingredient>
{
    [MapperIgnoreTarget(nameof(Ingredient.Id))]
    [MapperIgnoreTarget(nameof(Ingredient.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Ingredient.ConcurrencyStamp))]
    public override partial Ingredient Map(CreateUpdateIngredientDto source);

    [MapperIgnoreTarget(nameof(Ingredient.Id))]
    [MapperIgnoreTarget(nameof(Ingredient.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Ingredient.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateIngredientDto source, Ingredient destination);
}


// StockBatch Mappers
[Mapper]
public partial class StockBatchToStockBatchDtoMapper : MapperBase<StockBatch, StockBatchDto>
{
    [MapperIgnoreSource(nameof(StockBatch.ExtraProperties))]
    [MapperIgnoreSource(nameof(StockBatch.ConcurrencyStamp))]
    public override partial StockBatchDto Map(StockBatch source);

    [MapperIgnoreSource(nameof(StockBatch.ExtraProperties))]
    [MapperIgnoreSource(nameof(StockBatch.ConcurrencyStamp))]
    public override partial void Map(StockBatch source, StockBatchDto destination);
}

[Mapper]
public partial class CreateUpdateStockBatchDtoToStockBatchMapper : MapperBase<CreateUpdateStockBatchDto, StockBatch>
{
    [MapperIgnoreTarget(nameof(StockBatch.Id))]
    [MapperIgnoreTarget(nameof(StockBatch.ExtraProperties))]
    [MapperIgnoreTarget(nameof(StockBatch.ConcurrencyStamp))]
    public override partial StockBatch Map(CreateUpdateStockBatchDto source);

    [MapperIgnoreTarget(nameof(StockBatch.Id))]
    [MapperIgnoreTarget(nameof(StockBatch.ExtraProperties))]
    [MapperIgnoreTarget(nameof(StockBatch.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateStockBatchDto source, StockBatch destination);
}


// StockMovementLog Mappers
[Mapper]
public partial class StockMovementLogToStockMovementLogDtoMapper : MapperBase<StockMovementLog, StockMovementLogDto>
{
    // ExtraProperties olmadığı için ignore etmeye gerek yok
    public override partial StockMovementLogDto Map(StockMovementLog source);

    public override partial void Map(StockMovementLog source, StockMovementLogDto destination);
}

[Mapper]
public partial class CreateUpdateStockMovementLogDtoToStockMovementLogMapper : MapperBase<CreateUpdateStockMovementLogDto, StockMovementLog>
{
    [MapperIgnoreTarget(nameof(StockMovementLog.Id))]
    public override partial StockMovementLog Map(CreateUpdateStockMovementLogDto source);

    [MapperIgnoreTarget(nameof(StockMovementLog.Id))]
    public override partial void Map(CreateUpdateStockMovementLogDto source, StockMovementLog destination);
}


// Warehouse Mappers
[Mapper]
public partial class WarehouseToWarehouseDtoMapper : MapperBase<Warehouse, WarehouseDto>
{
    [MapperIgnoreSource(nameof(Warehouse.ExtraProperties))]
    [MapperIgnoreSource(nameof(Warehouse.ConcurrencyStamp))]
    public override partial WarehouseDto Map(Warehouse source);

    [MapperIgnoreSource(nameof(Warehouse.ExtraProperties))]
    [MapperIgnoreSource(nameof(Warehouse.ConcurrencyStamp))]
    public override partial void Map(Warehouse source, WarehouseDto destination);
}

[Mapper]
public partial class CreateUpdateWarehouseDtoToWarehouseMapper : MapperBase<CreateUpdateWarehouseDto, Warehouse>
{
    [MapperIgnoreTarget(nameof(Warehouse.Id))]
    [MapperIgnoreTarget(nameof(Warehouse.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Warehouse.ConcurrencyStamp))]
    public override partial Warehouse Map(CreateUpdateWarehouseDto source);

    [MapperIgnoreTarget(nameof(Warehouse.Id))]
    [MapperIgnoreTarget(nameof(Warehouse.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Warehouse.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateWarehouseDto source, Warehouse destination);
}

// Invoice Mappers
[Mapper]
public partial class InvoiceToInvoiceDtoMapper : MapperBase<Invoice, InvoiceDto>
{
    [MapperIgnoreSource(nameof(Invoice.ExtraProperties))]
    [MapperIgnoreSource(nameof(Invoice.ConcurrencyStamp))]
    public override partial InvoiceDto Map(Invoice source);

    [MapperIgnoreSource(nameof(Invoice.ExtraProperties))]
    [MapperIgnoreSource(nameof(Invoice.ConcurrencyStamp))]
    public override partial void Map(Invoice source, InvoiceDto destination);
}

[Mapper]
public partial class CreateUpdateInvoiceDtoToInvoiceMapper : MapperBase<CreateUpdateInvoiceDto, Invoice>
{
    [MapperIgnoreTarget(nameof(Invoice.Id))]
    [MapperIgnoreTarget(nameof(Invoice.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Invoice.ConcurrencyStamp))]
    public override partial Invoice Map(CreateUpdateInvoiceDto source);

    [MapperIgnoreTarget(nameof(Invoice.Id))]
    [MapperIgnoreTarget(nameof(Invoice.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Invoice.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateInvoiceDto source, Invoice destination);
}
// Shipment Mappers
[Mapper]
public partial class ShipmentToShipmentDtoMapper : MapperBase<Shipment, ShipmentDto>
{
    [MapperIgnoreSource(nameof(Shipment.ExtraProperties))]
    [MapperIgnoreSource(nameof(Shipment.ConcurrencyStamp))]
    public override partial ShipmentDto Map(Shipment source);

    [MapperIgnoreSource(nameof(Shipment.ExtraProperties))]
    [MapperIgnoreSource(nameof(Shipment.ConcurrencyStamp))]
    public override partial void Map(Shipment source, ShipmentDto destination);
}

[Mapper]
public partial class CreateUpdateShipmentDtoToShipmentMapper : MapperBase<CreateUpdateShipmentDto, Shipment>
{
    [MapperIgnoreTarget(nameof(Shipment.Id))]
    [MapperIgnoreTarget(nameof(Shipment.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Shipment.ConcurrencyStamp))]
    public override partial Shipment Map(CreateUpdateShipmentDto source);

    [MapperIgnoreTarget(nameof(Shipment.Id))]
    [MapperIgnoreTarget(nameof(Shipment.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Shipment.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateShipmentDto source, Shipment destination);
}
// DrugPriceHistory Mappers
[Mapper]
public partial class DrugPriceHistoryToDrugPriceHistoryDtoMapper : MapperBase<DrugPriceHistory, DrugPriceHistoryDto>
{
    [MapperIgnoreSource(nameof(DrugPriceHistory.ExtraProperties))]
    [MapperIgnoreSource(nameof(DrugPriceHistory.ConcurrencyStamp))]
    public override partial DrugPriceHistoryDto Map(DrugPriceHistory source);

    [MapperIgnoreSource(nameof(DrugPriceHistory.ExtraProperties))]
    [MapperIgnoreSource(nameof(DrugPriceHistory.ConcurrencyStamp))]
    public override partial void Map(DrugPriceHistory source, DrugPriceHistoryDto destination);
}

[Mapper]
public partial class CreateUpdateDrugPriceHistoryDtoToDrugPriceHistoryMapper : MapperBase<CreateUpdateDrugPriceHistoryDto, DrugPriceHistory>
{
    [MapperIgnoreTarget(nameof(DrugPriceHistory.Id))]
    [MapperIgnoreTarget(nameof(DrugPriceHistory.ExtraProperties))]
    [MapperIgnoreTarget(nameof(DrugPriceHistory.ConcurrencyStamp))]
    public override partial DrugPriceHistory Map(CreateUpdateDrugPriceHistoryDto source);

    [MapperIgnoreTarget(nameof(DrugPriceHistory.Id))]
    [MapperIgnoreTarget(nameof(DrugPriceHistory.ExtraProperties))]
    [MapperIgnoreTarget(nameof(DrugPriceHistory.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateDrugPriceHistoryDto source, DrugPriceHistory destination);
}
// Pharmacy Mappers
[Mapper]
public partial class PharmacyToPharmacyDtoMapper : MapperBase<Pharmacy, PharmacyDto>
{
    [MapperIgnoreSource(nameof(Pharmacy.ExtraProperties))]
    [MapperIgnoreSource(nameof(Pharmacy.ConcurrencyStamp))]
    public override partial PharmacyDto Map(Pharmacy source);

    [MapperIgnoreSource(nameof(Pharmacy.ExtraProperties))]
    [MapperIgnoreSource(nameof(Pharmacy.ConcurrencyStamp))]
    public override partial void Map(Pharmacy source, PharmacyDto destination);
}

[Mapper]
public partial class CreateUpdatePharmacyDtoToPharmacyMapper : MapperBase<CreateUpdatePharmacyDto, Pharmacy>
{
    [MapperIgnoreTarget(nameof(Pharmacy.Id))]
    [MapperIgnoreTarget(nameof(Pharmacy.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Pharmacy.ConcurrencyStamp))]
    public override partial Pharmacy Map(CreateUpdatePharmacyDto source);

    [MapperIgnoreTarget(nameof(Pharmacy.Id))]
    [MapperIgnoreTarget(nameof(Pharmacy.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Pharmacy.ConcurrencyStamp))]
    public override partial void Map(CreateUpdatePharmacyDto source, Pharmacy destination);
}
// Customer Mappers
[Mapper]
public partial class CustomerToCustomerDtoMapper : MapperBase<Customer, CustomerDto>
{
    [MapperIgnoreSource(nameof(Customer.ExtraProperties))]
    [MapperIgnoreSource(nameof(Customer.ConcurrencyStamp))]
    public override partial CustomerDto Map(Customer source);

    [MapperIgnoreSource(nameof(Customer.ExtraProperties))]
    [MapperIgnoreSource(nameof(Customer.ConcurrencyStamp))]
    public override partial void Map(Customer source, CustomerDto destination);
}

[Mapper]
public partial class CreateUpdateCustomerDtoToCustomerMapper : MapperBase<CreateUpdateCustomerDto, Customer>
{
    [MapperIgnoreTarget(nameof(Customer.Id))]
    [MapperIgnoreTarget(nameof(Customer.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Customer.ConcurrencyStamp))]
    public override partial Customer Map(CreateUpdateCustomerDto source);

    [MapperIgnoreTarget(nameof(Customer.Id))]
    [MapperIgnoreTarget(nameof(Customer.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Customer.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateCustomerDto source, Customer destination);
}

// Order Mappers
[Mapper]
public partial class OrderToOrderDtoMapper : MapperBase<Order, OrderDto>
{
    [MapperIgnoreSource(nameof(Order.ExtraProperties))]
    [MapperIgnoreSource(nameof(Order.ConcurrencyStamp))]
    public override partial OrderDto Map(Order source);

    [MapperIgnoreSource(nameof(Order.ExtraProperties))]
    [MapperIgnoreSource(nameof(Order.ConcurrencyStamp))]
    public override partial void Map(Order source, OrderDto destination);
}

[Mapper]
public partial class CreateUpdateOrderDtoToOrderMapper : MapperBase<CreateUpdateOrderDto, Order>
{
    [MapperIgnoreTarget(nameof(Order.Id))]
    [MapperIgnoreTarget(nameof(Order.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Order.ConcurrencyStamp))]
    public override partial Order Map(CreateUpdateOrderDto source);

    [MapperIgnoreTarget(nameof(Order.Id))]
    [MapperIgnoreTarget(nameof(Order.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Order.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateOrderDto source, Order destination);
}
// Sale Mappers
[Mapper]
public partial class SaleToSaleDtoMapper : MapperBase<Sale, SaleDto>
{
    [MapperIgnoreSource(nameof(Sale.ExtraProperties))]
    [MapperIgnoreSource(nameof(Sale.ConcurrencyStamp))]
    [MapperIgnoreSource(nameof(Sale.IsDeleted))]
    [MapperIgnoreSource(nameof(Sale.DeleterId))]
    [MapperIgnoreSource(nameof(Sale.DeletionTime))]
    [MapperIgnoreSource(nameof(Sale.LastModificationTime))]
    [MapperIgnoreSource(nameof(Sale.LastModifierId))]
    [MapperIgnoreSource(nameof(Sale.CreationTime))]
    [MapperIgnoreSource(nameof(Sale.CreatorId))]
    public override partial SaleDto Map(Sale source);

    [MapperIgnoreSource(nameof(Sale.ExtraProperties))]
    [MapperIgnoreSource(nameof(Sale.ConcurrencyStamp))]
    [MapperIgnoreSource(nameof(Sale.IsDeleted))]
    [MapperIgnoreSource(nameof(Sale.DeleterId))]
    [MapperIgnoreSource(nameof(Sale.DeletionTime))]
    [MapperIgnoreSource(nameof(Sale.LastModificationTime))]
    [MapperIgnoreSource(nameof(Sale.LastModifierId))]
    [MapperIgnoreSource(nameof(Sale.CreationTime))]
    [MapperIgnoreSource(nameof(Sale.CreatorId))]
    public override partial void Map(Sale source, SaleDto destination);
}

[Mapper]
public partial class CreateUpdateSaleDtoToSaleMapper : MapperBase<CreateUpdateSaleDto, Sale>
{
    [MapperIgnoreTarget(nameof(Sale.Id))]
    [MapperIgnoreTarget(nameof(Sale.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Sale.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(Sale.IsDeleted))]
    [MapperIgnoreTarget(nameof(Sale.DeleterId))]
    [MapperIgnoreTarget(nameof(Sale.DeletionTime))]
    [MapperIgnoreTarget(nameof(Sale.LastModificationTime))]
    [MapperIgnoreTarget(nameof(Sale.LastModifierId))]
    [MapperIgnoreTarget(nameof(Sale.CreationTime))]
    [MapperIgnoreTarget(nameof(Sale.CreatorId))]
    public override partial Sale Map(CreateUpdateSaleDto source);

    [MapperIgnoreTarget(nameof(Sale.Id))]
    [MapperIgnoreTarget(nameof(Sale.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Sale.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(Sale.IsDeleted))]
    [MapperIgnoreTarget(nameof(Sale.DeleterId))]
    [MapperIgnoreTarget(nameof(Sale.DeletionTime))]
    [MapperIgnoreTarget(nameof(Sale.LastModificationTime))]
    [MapperIgnoreTarget(nameof(Sale.LastModifierId))]
    [MapperIgnoreTarget(nameof(Sale.CreationTime))]
    [MapperIgnoreTarget(nameof(Sale.CreatorId))]
    public override partial void Map(CreateUpdateSaleDto source, Sale destination);
}
// Return Mappers
[Mapper]
public partial class ReturnToReturnDtoMapper : MapperBase<Return, ReturnDto>
{
    [MapperIgnoreSource(nameof(Return.ExtraProperties))]
    [MapperIgnoreSource(nameof(Return.ConcurrencyStamp))]
    public override partial ReturnDto Map(Return source);

    [MapperIgnoreSource(nameof(Return.ExtraProperties))]
    [MapperIgnoreSource(nameof(Return.ConcurrencyStamp))]
    public override partial void Map(Return source, ReturnDto destination);
}

[Mapper]
public partial class CreateUpdateReturnDtoToReturnMapper : MapperBase<CreateUpdateReturnDto, Return>
{
    [MapperIgnoreTarget(nameof(Return.Id))]
    [MapperIgnoreTarget(nameof(Return.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Return.ConcurrencyStamp))]
    public override partial Return Map(CreateUpdateReturnDto source);

    [MapperIgnoreTarget(nameof(Return.Id))]
    [MapperIgnoreTarget(nameof(Return.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Return.ConcurrencyStamp))]
    public override partial void Map(CreateUpdateReturnDto source, Return destination);
}
// Prescription Mappers
[Mapper]
public partial class PrescriptionToPrescriptionDtoMapper : MapperBase<Prescription, PrescriptionDto>
{
    [MapperIgnoreSource(nameof(Prescription.ExtraProperties))]
    [MapperIgnoreSource(nameof(Prescription.ConcurrencyStamp))]
    public override partial PrescriptionDto Map(Prescription source);

    [MapperIgnoreSource(nameof(Prescription.ExtraProperties))]
    [MapperIgnoreSource(nameof(Prescription.ConcurrencyStamp))]
    public override partial void Map(Prescription source, PrescriptionDto destination);
}

[Mapper]
public partial class CreateUpdatePrescriptionDtoToPrescriptionMapper : MapperBase<CreateUpdatePrescriptionDto, Prescription>
{
    [MapperIgnoreTarget(nameof(Prescription.Id))]
    [MapperIgnoreTarget(nameof(Prescription.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Prescription.ConcurrencyStamp))]
    public override partial Prescription Map(CreateUpdatePrescriptionDto source);

    [MapperIgnoreTarget(nameof(Prescription.Id))]
    [MapperIgnoreTarget(nameof(Prescription.ExtraProperties))]
    [MapperIgnoreTarget(nameof(Prescription.ConcurrencyStamp))]
    public override partial void Map(CreateUpdatePrescriptionDto source, Prescription destination);
}




[Mapper]
public partial class CreateUpdateDrugIngredientDtoToDrugIngredientMapper : MapperBase<CreateUpdateDrugIngredientDto, DrugIngredient>
{
    [MapperIgnoreTarget(nameof(DrugIngredient.Id))]
    [MapperIgnoreTarget(nameof(DrugIngredient.CreationTime))]
    [MapperIgnoreTarget(nameof(DrugIngredient.CreatorId))]
    public override partial DrugIngredient Map(CreateUpdateDrugIngredientDto source);

    [MapperIgnoreTarget(nameof(DrugIngredient.Id))]
    [MapperIgnoreTarget(nameof(DrugIngredient.CreationTime))]
    [MapperIgnoreTarget(nameof(DrugIngredient.CreatorId))]
    public override partial void Map(CreateUpdateDrugIngredientDto source, DrugIngredient destination);
}

[Mapper]
public partial class DrugIngredientToDrugIngredientDtoMapper : MapperBase<DrugIngredient, DrugIngredientDto>
{
    public override partial DrugIngredientDto Map(DrugIngredient source);
    public override partial void Map(DrugIngredient source, DrugIngredientDto destination);
}

// 1. DTO -> Entity (POST ve PUT İşlemleri İçin) PharmacyStockDto -> PharmacyStock
[Mapper]
public partial class CreateUpdatePharmacyStockDtoToPharmacyStockMapper : MapperBase<CreateUpdatePharmacyStockDto, PharmacyStock>
{
    [MapperIgnoreTarget(nameof(PharmacyStock.Id))]
    [MapperIgnoreTarget(nameof(PharmacyStock.ExtraProperties))]
    [MapperIgnoreTarget(nameof(PharmacyStock.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(PharmacyStock.CreationTime))]
    [MapperIgnoreTarget(nameof(PharmacyStock.CreatorId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.LastModificationTime))]
    [MapperIgnoreTarget(nameof(PharmacyStock.LastModifierId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.IsDeleted))]
    [MapperIgnoreTarget(nameof(PharmacyStock.DeleterId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.DeletionTime))]
    public override partial PharmacyStock Map(CreateUpdatePharmacyStockDto source);

    [MapperIgnoreTarget(nameof(PharmacyStock.Id))]
    [MapperIgnoreTarget(nameof(PharmacyStock.ExtraProperties))]
    [MapperIgnoreTarget(nameof(PharmacyStock.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(PharmacyStock.CreationTime))]
    [MapperIgnoreTarget(nameof(PharmacyStock.CreatorId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.LastModificationTime))]
    [MapperIgnoreTarget(nameof(PharmacyStock.LastModifierId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.IsDeleted))]
    [MapperIgnoreTarget(nameof(PharmacyStock.DeleterId))]
    [MapperIgnoreTarget(nameof(PharmacyStock.DeletionTime))]
    public override partial void Map(CreateUpdatePharmacyStockDto source, PharmacyStock destination);
}

// 2. Entity -> DTO (GET İşlemleri İçin) Order Item -> OrderItemDto
[Mapper]
public partial class PharmacyStockToPharmacyStockDtoMapper : MapperBase<PharmacyStock, PharmacyStockDto>
{
    public override partial PharmacyStockDto Map(PharmacyStock source);
    
    public override partial void Map(PharmacyStock source, PharmacyStockDto destination);
}

// 1. DTO -> Entity (POST ve PUT) Order Item -> OrderItem
[Mapper]
public partial class CreateUpdateOrderItemDtoToOrderItemMapper : MapperBase<CreateUpdateOrderItemDto, OrderItem>
{
    [MapperIgnoreTarget(nameof(OrderItem.Id))]
    [MapperIgnoreTarget(nameof(OrderItem.CreationTime))]
    [MapperIgnoreTarget(nameof(OrderItem.CreatorId))]
    public override partial OrderItem Map(CreateUpdateOrderItemDto source);

    [MapperIgnoreTarget(nameof(OrderItem.Id))]
    [MapperIgnoreTarget(nameof(OrderItem.CreationTime))]
    [MapperIgnoreTarget(nameof(OrderItem.CreatorId))]
    public override partial void Map(CreateUpdateOrderItemDto source, OrderItem destination);
}

// 2. Entity -> DTO (GET) OrderItem -> OrderItemDto
[Mapper]
public partial class OrderItemToOrderItemDtoMapper : MapperBase<OrderItem, OrderItemDto>
{
    public override partial OrderItemDto Map(OrderItem source);
    
    public override partial void Map(OrderItem source, OrderItemDto destination);
}

// 1. DTO -> Entity (POST ve PUT)
[Mapper]
public partial class CreateUpdateShipmentItemDtoToShipmentItemMapper : MapperBase<CreateUpdateShipmentItemDto, ShipmentItem>
{
    [MapperIgnoreTarget(nameof(ShipmentItem.Id))]
    [MapperIgnoreTarget(nameof(ShipmentItem.CreationTime))]
    [MapperIgnoreTarget(nameof(ShipmentItem.CreatorId))]
    public override partial ShipmentItem Map(CreateUpdateShipmentItemDto source);

    [MapperIgnoreTarget(nameof(ShipmentItem.Id))]
    [MapperIgnoreTarget(nameof(ShipmentItem.CreationTime))]
    [MapperIgnoreTarget(nameof(ShipmentItem.CreatorId))]
    public override partial void Map(CreateUpdateShipmentItemDto source, ShipmentItem destination);
}

// 2. Entity -> DTO (GET)
[Mapper]
public partial class ShipmentItemToShipmentItemDtoMapper : MapperBase<ShipmentItem, ShipmentItemDto>
{
    public override partial ShipmentItemDto Map(ShipmentItem source);
    
    public override partial void Map(ShipmentItem source, ShipmentItemDto destination);
}
// 1. DTO -> Entity (POST ve PUT İşlemleri İçin)
[Mapper]
public partial class CreateUpdateReturnItemDtoToReturnItemMapper : MapperBase<CreateUpdateReturnItemDto, ReturnItem>
{
    [MapperIgnoreTarget(nameof(ReturnItem.Id))]
    [MapperIgnoreTarget(nameof(ReturnItem.CreationTime))]
    [MapperIgnoreTarget(nameof(ReturnItem.CreatorId))]
    public override partial ReturnItem Map(CreateUpdateReturnItemDto source);

    [MapperIgnoreTarget(nameof(ReturnItem.Id))]
    [MapperIgnoreTarget(nameof(ReturnItem.CreationTime))]
    [MapperIgnoreTarget(nameof(ReturnItem.CreatorId))]
    public override partial void Map(CreateUpdateReturnItemDto source, ReturnItem destination);
}

// 2. Entity -> DTO (GET İşlemleri İçin)
[Mapper]
public partial class ReturnItemToReturnItemDtoMapper : MapperBase<ReturnItem, ReturnItemDto>
{
    public override partial ReturnItemDto Map(ReturnItem source);
    
    public override partial void Map(ReturnItem source, ReturnItemDto destination);
}
// 1. DTO -> Entity (POST ve PUT)
[Mapper]
public partial class CreateUpdateSaleItemDtoToSaleItemMapper : MapperBase<CreateUpdateSaleItemDto, SaleItem>
{
    [MapperIgnoreTarget(nameof(SaleItem.Id))]
    [MapperIgnoreTarget(nameof(SaleItem.CreationTime))]
    [MapperIgnoreTarget(nameof(SaleItem.CreatorId))]
    public override partial SaleItem Map(CreateUpdateSaleItemDto source);

    [MapperIgnoreTarget(nameof(SaleItem.Id))]
    [MapperIgnoreTarget(nameof(SaleItem.CreationTime))]
    [MapperIgnoreTarget(nameof(SaleItem.CreatorId))]
    public override partial void Map(CreateUpdateSaleItemDto source, SaleItem destination);
}

// 2. Entity -> DTO (GET)
[Mapper]
public partial class SaleItemToSaleItemDtoMapper : MapperBase<SaleItem, SaleItemDto>
{
    public override partial SaleItemDto Map(SaleItem source);
    
    public override partial void Map(SaleItem source, SaleItemDto destination);
}



[Mapper]
public partial class InvoiceItemToInvoiceItemDtoMapper : MapperBase<InvoiceItem, InvoiceItemDto>
{
    public override partial InvoiceItemDto Map(InvoiceItem source);

    public override partial void Map(InvoiceItem source, InvoiceItemDto destination);
}

// PaymentMethod Mappers
[Mapper]
public partial class PaymentMethodToPaymentMethodDtoMapper : MapperBase<PaymentMethod, PaymentMethodDto>
{
    [MapperIgnoreSource(nameof(PaymentMethod.ExtraProperties))]
    [MapperIgnoreSource(nameof(PaymentMethod.ConcurrencyStamp))]
    public override partial PaymentMethodDto Map(PaymentMethod source);

    [MapperIgnoreSource(nameof(PaymentMethod.ExtraProperties))]
    [MapperIgnoreSource(nameof(PaymentMethod.ConcurrencyStamp))]
    public override partial void Map(PaymentMethod source, PaymentMethodDto destination);
}

[Mapper]
public partial class CreateUpdatePaymentMethodDtoToPaymentMethodMapper : MapperBase<CreateUpdatePaymentMethodDto, PaymentMethod>
{
    [MapperIgnoreTarget(nameof(PaymentMethod.Id))]
    [MapperIgnoreTarget(nameof(PaymentMethod.ExtraProperties))]
    [MapperIgnoreTarget(nameof(PaymentMethod.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(PaymentMethod.CreationTime))]
    [MapperIgnoreTarget(nameof(PaymentMethod.CreatorId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.LastModificationTime))]
    [MapperIgnoreTarget(nameof(PaymentMethod.LastModifierId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.IsDeleted))]
    [MapperIgnoreTarget(nameof(PaymentMethod.DeleterId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.DeletionTime))]
    public override partial PaymentMethod Map(CreateUpdatePaymentMethodDto source);

    [MapperIgnoreTarget(nameof(PaymentMethod.Id))]
    [MapperIgnoreTarget(nameof(PaymentMethod.ExtraProperties))]
    [MapperIgnoreTarget(nameof(PaymentMethod.ConcurrencyStamp))]
    [MapperIgnoreTarget(nameof(PaymentMethod.CreationTime))]
    [MapperIgnoreTarget(nameof(PaymentMethod.CreatorId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.LastModificationTime))]
    [MapperIgnoreTarget(nameof(PaymentMethod.LastModifierId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.IsDeleted))]
    [MapperIgnoreTarget(nameof(PaymentMethod.DeleterId))]
    [MapperIgnoreTarget(nameof(PaymentMethod.DeletionTime))]
    public override partial void Map(CreateUpdatePaymentMethodDto source, PaymentMethod destination);
}

