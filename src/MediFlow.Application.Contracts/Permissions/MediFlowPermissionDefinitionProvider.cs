using MediFlow.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace MediFlow.Permissions;

public class MediFlowPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(MediFlowPermissions.GroupName);

        #region Dashboard
        myGroup.AddPermission(MediFlowPermissions.Dashboard, L("Menü:Dashboard"));
        myGroup.AddPermission(MediFlowPermissions.DashboardStats, L("Menü:Dashboard.Stats"));
        myGroup.AddPermission(MediFlowPermissions.DashboardTrend, L("Menü:Dashboard.Trend"));
        #endregion

        #region Drugs
        myGroup.AddPermission(MediFlowPermissions.Drugs, L("Menü:Drugs"));
        myGroup.AddPermission(MediFlowPermissions.DrugsCreate, L("Menü:Drugs.Create"));
        myGroup.AddPermission(MediFlowPermissions.DrugsEdit, L("Menü:Drugs.Edit"));
        myGroup.AddPermission(MediFlowPermissions.DrugsDelete, L("Menü:Drugs.Delete"));
        myGroup.AddPermission(MediFlowPermissions.DrugsView, L("Menü:Drugs.View"));
        #endregion

        #region Ingredients
        myGroup.AddPermission(MediFlowPermissions.Ingredients, L("Menü:Ingredients"));
        myGroup.AddPermission(MediFlowPermissions.IngredientsCreate, L("Menü:Ingredients.Create"));
        myGroup.AddPermission(MediFlowPermissions.IngredientsEdit, L("Menü:Ingredients.Edit"));
        myGroup.AddPermission(MediFlowPermissions.IngredientsDelete, L("Menü:Ingredients.Delete"));
        myGroup.AddPermission(MediFlowPermissions.IngredientsView, L("Menü:Ingredients.View"));
        #endregion

        #region Pharmacies
        myGroup.AddPermission(MediFlowPermissions.Pharmacies, L("Menü:Pharmacies"));
        myGroup.AddPermission(MediFlowPermissions.PharmaciesCreate, L("Menü:Pharmacies.Create"));
        myGroup.AddPermission(MediFlowPermissions.PharmaciesEdit, L("Menü:Pharmacies.Edit"));
        myGroup.AddPermission(MediFlowPermissions.PharmaciesDelete, L("Menü:Pharmacies.Delete"));
        myGroup.AddPermission(MediFlowPermissions.PharmaciesView, L("Menü:Pharmacies.View"));
        #endregion

        #region Suppliers
        myGroup.AddPermission(MediFlowPermissions.Suppliers, L("Menü:Suppliers"));
        myGroup.AddPermission(MediFlowPermissions.SuppliersCreate, L("Menü:Suppliers.Create"));
        myGroup.AddPermission(MediFlowPermissions.SuppliersEdit, L("Menü:Suppliers.Edit"));
        myGroup.AddPermission(MediFlowPermissions.SuppliersDelete, L("Menü:Suppliers.Delete"));
        myGroup.AddPermission(MediFlowPermissions.SuppliersView, L("Menü:Suppliers.View"));
        #endregion

        #region Customers
        myGroup.AddPermission(MediFlowPermissions.Customers, L("Menü:Customers"));
        myGroup.AddPermission(MediFlowPermissions.CustomersCreate, L("Menü:Customers.Create"));
        myGroup.AddPermission(MediFlowPermissions.CustomersEdit, L("Menü:Customers.Edit"));
        myGroup.AddPermission(MediFlowPermissions.CustomersDelete, L("Menü:Customers.Delete"));
        myGroup.AddPermission(MediFlowPermissions.CustomersView, L("Menü:Customers.View"));
        #endregion

        #region Warehouses
        myGroup.AddPermission(MediFlowPermissions.Warehouses, L("Menü:Warehouses"));
        myGroup.AddPermission(MediFlowPermissions.WarehousesCreate, L("Menü:Warehouses.Create"));
        myGroup.AddPermission(MediFlowPermissions.WarehousesEdit, L("Menü:Warehouses.Edit"));
        myGroup.AddPermission(MediFlowPermissions.WarehousesDelete, L("Menü:Warehouses.Delete"));
        myGroup.AddPermission(MediFlowPermissions.WarehousesView, L("Menü:Warehouses.View"));
        #endregion

        #region Orders
        myGroup.AddPermission(MediFlowPermissions.Orders, L("Menü:Orders"));
        myGroup.AddPermission(MediFlowPermissions.OrdersCreate, L("Menü:Orders.Create"));
        myGroup.AddPermission(MediFlowPermissions.OrdersEdit, L("Menü:Orders.Edit"));
        myGroup.AddPermission(MediFlowPermissions.OrdersDelete, L("Menü:Orders.Delete"));
        myGroup.AddPermission(MediFlowPermissions.OrdersView, L("Menü:Orders.View"));
        myGroup.AddPermission(MediFlowPermissions.OrdersApprove, L("Menü:Orders.Approve"));
        #endregion

        #region Shipments
        myGroup.AddPermission(MediFlowPermissions.Shipments, L("Menü:Shipments"));
        myGroup.AddPermission(MediFlowPermissions.ShipmentsCreate, L("Menü:Shipments.Create"));
        myGroup.AddPermission(MediFlowPermissions.ShipmentsEdit, L("Menü:Shipments.Edit"));
        myGroup.AddPermission(MediFlowPermissions.ShipmentsDelete, L("Menü:Shipments.Delete"));
        myGroup.AddPermission(MediFlowPermissions.ShipmentsView, L("Menü:Shipments.View"));
        myGroup.AddPermission(MediFlowPermissions.ShipmentsDispatch, L("Menü:Shipments.Dispatch"));
        #endregion

        #region Invoices
        myGroup.AddPermission(MediFlowPermissions.Invoices, L("Menü:Invoices"));
        myGroup.AddPermission(MediFlowPermissions.InvoicesCreate, L("Menü:Invoices.Create"));
        myGroup.AddPermission(MediFlowPermissions.InvoicesEdit, L("Menü:Invoices.Edit"));
        myGroup.AddPermission(MediFlowPermissions.InvoicesDelete, L("Menü:Invoices.Delete"));
        myGroup.AddPermission(MediFlowPermissions.InvoicesView, L("Menü:Invoices.View"));
        myGroup.AddPermission(MediFlowPermissions.InvoicesCancel, L("Menü:Invoices.Cancel"));
        #endregion

        #region Payments
        myGroup.AddPermission(MediFlowPermissions.Payments, L("Menü:Payments"));
        myGroup.AddPermission(MediFlowPermissions.PaymentsCreate, L("Menü:Payments.Create"));
        myGroup.AddPermission(MediFlowPermissions.PaymentsEdit, L("Menü:Payments.Edit"));
        myGroup.AddPermission(MediFlowPermissions.PaymentsDelete, L("Menü:Payments.Delete"));
        myGroup.AddPermission(MediFlowPermissions.PaymentsView, L("Menü:Payments.View"));
        #endregion

        #region Sales
        myGroup.AddPermission(MediFlowPermissions.Sales, L("Menü:Sales"));
        myGroup.AddPermission(MediFlowPermissions.SalesCreate, L("Menü:Sales.Create"));
        myGroup.AddPermission(MediFlowPermissions.SalesEdit, L("Menü:Sales.Edit"));
        myGroup.AddPermission(MediFlowPermissions.SalesDelete, L("Menü:Sales.Delete"));
        myGroup.AddPermission(MediFlowPermissions.SalesView, L("Menü:Sales.View"));
        myGroup.AddPermission(MediFlowPermissions.SalesCancel, L("Menü:Sales.Cancel"));
        #endregion

        #region Returns
        myGroup.AddPermission(MediFlowPermissions.Returns, L("Menü:Returns"));
        myGroup.AddPermission(MediFlowPermissions.ReturnsCreate, L("Menü:Returns.Create"));
        myGroup.AddPermission(MediFlowPermissions.ReturnsEdit, L("Menü:Returns.Edit"));
        myGroup.AddPermission(MediFlowPermissions.ReturnsDelete, L("Menü:Returns.Delete"));
        myGroup.AddPermission(MediFlowPermissions.ReturnsView, L("Menü:Returns.View"));
        #endregion

        #region Prescriptions
        myGroup.AddPermission(MediFlowPermissions.Prescriptions, L("Menü:Prescriptions"));
        myGroup.AddPermission(MediFlowPermissions.PrescriptionsCreate, L("Menü:Prescriptions.Create"));
        myGroup.AddPermission(MediFlowPermissions.PrescriptionsEdit, L("Menü:Prescriptions.Edit"));
        myGroup.AddPermission(MediFlowPermissions.PrescriptionsDelete, L("Menü:Prescriptions.Delete"));
        myGroup.AddPermission(MediFlowPermissions.PrescriptionsView, L("Menü:Prescriptions.View"));
        #endregion

        #region Inventory
        myGroup.AddPermission(MediFlowPermissions.InventoryView, L("Menü:Inventory.View"));
        myGroup.AddPermission(MediFlowPermissions.InventoryManage, L("Menü:Inventory.Manage"));
        #endregion

        #region Pricing
        myGroup.AddPermission(MediFlowPermissions.PricingView, L("Menü:Pricing.View"));
        myGroup.AddPermission(MediFlowPermissions.PricingManage, L("Menü:Pricing.Manage"));
        #endregion

        #region Users
        myGroup.AddPermission(MediFlowPermissions.Users, L("Menü:Users"));
        myGroup.AddPermission(MediFlowPermissions.UsersCreate, L("Menü:Users.Create"));
        myGroup.AddPermission(MediFlowPermissions.UsersEdit, L("Menü:Users.Edit"));
        myGroup.AddPermission(MediFlowPermissions.UsersDelete, L("Menü:Users.Delete"));
        myGroup.AddPermission(MediFlowPermissions.UsersView, L("Menü:Users.View"));
        myGroup.AddPermission(MediFlowPermissions.UsersManageRoles, L("Menü:Users.ManageRoles"));
        #endregion

        #region Reports
        myGroup.AddPermission(MediFlowPermissions.ReportsView, L("Menü:Reports.View"));
        myGroup.AddPermission(MediFlowPermissions.ReportsExport, L("Menü:Reports.Export"));
        #endregion
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<MediFlowResource>(name);
    }
}