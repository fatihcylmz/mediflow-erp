namespace MediFlow.Permissions;

public static class MediFlowPermissions
{
    public const string GroupName = "MediFlow";

    #region Dashboard
    public const string Dashboard = GroupName + ".Dashboard";
    public const string DashboardStats = Dashboard + ".Stats";
    public const string DashboardTrend = Dashboard + ".Trend";
    #endregion

    #region Drugs
    public const string Drugs = GroupName + ".Drugs";
    public const string DrugsCreate = Drugs + ".Create";
    public const string DrugsEdit = Drugs + ".Edit";
    public const string DrugsDelete = Drugs + ".Delete";
    public const string DrugsView = Drugs + ".View";
    #endregion

    #region Ingredients
    public const string Ingredients = GroupName + ".Ingredients";
    public const string IngredientsCreate = Ingredients + ".Create";
    public const string IngredientsEdit = Ingredients + ".Edit";
    public const string IngredientsDelete = Ingredients + ".Delete";
    public const string IngredientsView = Ingredients + ".View";
    #endregion

    #region Pharmacies
    public const string Pharmacies = GroupName + ".Pharmacies";
    public const string PharmaciesCreate = Pharmacies + ".Create";
    public const string PharmaciesEdit = Pharmacies + ".Edit";
    public const string PharmaciesDelete = Pharmacies + ".Delete";
    public const string PharmaciesView = Pharmacies + ".View";
    #endregion

    #region Suppliers
    public const string Suppliers = GroupName + ".Suppliers";
    public const string SuppliersCreate = Suppliers + ".Create";
    public const string SuppliersEdit = Suppliers + ".Edit";
    public const string SuppliersDelete = Suppliers + ".Delete";
    public const string SuppliersView = Suppliers + ".View";
    #endregion

    #region Customers
    public const string Customers = GroupName + ".Customers";
    public const string CustomersCreate = Customers + ".Create";
    public const string CustomersEdit = Customers + ".Edit";
    public const string CustomersDelete = Customers + ".Delete";
    public const string CustomersView = Customers + ".View";
    #endregion

    #region Warehouses
    public const string Warehouses = GroupName + ".Warehouses";
    public const string WarehousesCreate = Warehouses + ".Create";
    public const string WarehousesEdit = Warehouses + ".Edit";
    public const string WarehousesDelete = Warehouses + ".Delete";
    public const string WarehousesView = Warehouses + ".View";
    #endregion

    #region Orders
    public const string Orders = GroupName + ".Orders";
    public const string OrdersCreate = Orders + ".Create";
    public const string OrdersEdit = Orders + ".Edit";
    public const string OrdersDelete = Orders + ".Delete";
    public const string OrdersView = Orders + ".View";
    public const string OrdersApprove = Orders + ".Approve";
    #endregion

    #region Shipments
    public const string Shipments = GroupName + ".Shipments";
    public const string ShipmentsCreate = Shipments + ".Create";
    public const string ShipmentsEdit = Shipments + ".Edit";
    public const string ShipmentsDelete = Shipments + ".Delete";
    public const string ShipmentsView = Shipments + ".View";
    public const string ShipmentsDispatch = Shipments + ".Dispatch";
    #endregion

    #region Invoices
    public const string Invoices = GroupName + ".Invoices";
    public const string InvoicesCreate = Invoices + ".Create";
    public const string InvoicesEdit = Invoices + ".Edit";
    public const string InvoicesDelete = Invoices + ".Delete";
    public const string InvoicesView = Invoices + ".View";
    public const string InvoicesCancel = Invoices + ".Cancel";
    #endregion

    #region Payments
    public const string Payments = GroupName + ".Payments";
    public const string PaymentsCreate = Payments + ".Create";
    public const string PaymentsEdit = Payments + ".Edit";
    public const string PaymentsDelete = Payments + ".Delete";
    public const string PaymentsView = Payments + ".View";
    #endregion

    #region Sales
    public const string Sales = GroupName + ".Sales";
    public const string SalesCreate = Sales + ".Create";
    public const string SalesEdit = Sales + ".Edit";
    public const string SalesDelete = Sales + ".Delete";
    public const string SalesView = Sales + ".View";
    public const string SalesCancel = Sales + ".Cancel";
    #endregion

    #region Returns
    public const string Returns = GroupName + ".Returns";
    public const string ReturnsCreate = Returns + ".Create";
    public const string ReturnsEdit = Returns + ".Edit";
    public const string ReturnsDelete = Returns + ".Delete";
    public const string ReturnsView = Returns + ".View";
    #endregion

    #region Prescriptions
    public const string Prescriptions = GroupName + ".Prescriptions";
    public const string PrescriptionsCreate = Prescriptions + ".Create";
    public const string PrescriptionsEdit = Prescriptions + ".Edit";
    public const string PrescriptionsDelete = Prescriptions + ".Delete";
    public const string PrescriptionsView = Prescriptions + ".View";
    #endregion

    #region Inventory
    public const string Inventory = GroupName + ".Inventory";
    public const string InventoryView = Inventory + ".View";
    public const string InventoryManage = Inventory + ".Manage";
    #endregion

    #region Pricing
    public const string Pricing = GroupName + ".Pricing";
    public const string PricingView = Pricing + ".View";
    public const string PricingManage = Pricing + ".Manage";
    #endregion

    #region Users
    public const string Users = GroupName + ".Users";
    public const string UsersCreate = Users + ".Create";
    public const string UsersEdit = Users + ".Edit";
    public const string UsersDelete = Users + ".Delete";
    public const string UsersView = Users + ".View";
    public const string UsersManageRoles = Users + ".ManageRoles";
    #endregion

    #region Reports
    public const string Reports = GroupName + ".Reports";
    public const string ReportsView = Reports + ".View";
    public const string ReportsExport = Reports + ".Export";
    #endregion
}