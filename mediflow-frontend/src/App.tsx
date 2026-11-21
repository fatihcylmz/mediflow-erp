import { useState, useEffect } from 'react';
import { ConfigProvider, Spin, Alert, Card, Table, Badge, Typography, Button } from 'antd';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import api from './services/api';
import LoginPage from './pages/LoginPage';
import DrugList from './pages/DrugList';
import PharmacyList from './pages/PharmacyList';
import SupplierList from './pages/SupplierList';
import WarehouseList from './pages/WarehouseList';
import OrderList from './pages/OrderList';
import ShipmentList from './pages/ShipmentList';
import InvoiceList from './pages/InvoiceList';
import InventoryList from './pages/InventoryList';
import IngredientList from './pages/IngredientList';
import PrescriptionList from './pages/PrescriptionList';
import DrugPriceHistoryList from './pages/DrugPriceHistoryList';
import ReturnList from './pages/ReturnList';
import SaleList from './pages/SaleList';
import UserManagementPage from './components/UserManagement/UserManagementPage';
import AdminLayout from './layouts/AdminLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import SupplierLayout from './layouts/SupplierLayout';
import WarehouseLayout from './layouts/WarehouseLayout';
import { mediflowTheme } from './config/theme';

// Auth helpers
const getRole = () => localStorage.getItem('role') as 'admin' | 'pharmacy' | 'supplier' | 'warehouse' | null;
const isAuthenticated = () => !!getRole() && !!localStorage.getItem('username');

function Dashboard() {
  const user = localStorage.getItem('username') || 'Kullanıcı';
  const [stats, setStats] = useState<{
    totalDrugs: number;
    pendingOrders: number;
    lowStockWarnings: Array<{
      drugId: string;
      drugName: string;
      currentStock: number;
      minimumStock: number;
      shortage: number;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .post<{ data: { totalDrugs: number; pendingOrders: number; lowStockWarnings: any[] } }>('/dashboard/get-stats')
      .then(r => {
        const d = r.data?.data ?? r.data;
        setStats({
          totalDrugs: d.totalDrugs ?? 0,
          pendingOrders: d.pendingOrders ?? 0,
          lowStockWarnings: d.lowStockWarnings ?? [],
        });
      })
      .catch(() => setError('Özet verileri yüklenemedi'));
  }, []);

  if (error) {
    return <Alert type="warning" message={error} style={{ marginBottom: 16 }} />;
  }

  const lowStockWarnings = stats?.lowStockWarnings ?? [];

  return (
    <div className="p-6 space-y-4">
      {stats === null ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-slate-800">Hoş Geldiniz, {user}</h2>
          <p className="text-slate-500">Sol menüden bir modül seçin.</p>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Toplam İlaç', val: stats.totalDrugs, color: '#1D4ED8' },
              { label: 'Bekleyen Sipariş', val: stats.pendingOrders, color: '#FF7A00' },
              { label: 'Düşük Stok Uyarısı', val: lowStockWarnings.length, color: '#DC2626' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Düşük Stok Uyarıları Paneli */}
          {lowStockWarnings.length > 0 && (
            <Card
              bordered
              title={<Title level={3} style={{ margin: 0, fontWeight: 700 }}>⚠️ Düşük Stok Uyarıları</Title>}
              extra={<Badge count={lowStockWarnings.length} color="error" />}
              style={{ background: '#FFF1F2', borderColor: '#FFCCD5' }}
            >
              <Table
                dataSource={lowStockWarnings.slice(0, 5)}
                columns={[
                  { title: 'İlaç', dataIndex: 'drugName', key: 'drugName' },
                  { title: 'Mevcut Stok', dataIndex: 'currentStock', key: 'currentStock' },
                  { title: 'Minimum Stok', dataIndex: 'minimumStock', key: 'minimumStock' },
                  { title: 'Eksik', dataIndex: 'shortage', key: 'shortage', render: (v: number) => <Text danger>{v} kutu</Text> },
                ]}
                pagination={{ pageSize: 5 }}
                size="small"
                locale={{ emptyText: <Text>Düşük stok uyarısı bulunmuyor.</Text> }}
              />
            </Card>
          )}
          <p className="text-slate-500 text-sm mt-4">Sol menüden bir modül seçin.</p>
        </>
      )}
    </div>
  );
}

interface PageProps { page?: string }

function AdminPages({ page }: PageProps) {
  switch (page) {
    case 'drugs': return <DrugList />;
    case 'ingredients': return <IngredientList />;
    case 'suppliers': return <SupplierList />;
    case 'warehouses': return <WarehouseList />;
    case 'orders': return <OrderList />;
    case 'shipments': return <ShipmentList />;
    case 'invoices': return <InvoiceList />;
    case 'inventories': return <InventoryList />;
    case 'prescriptions': return <PrescriptionList />;
    case 'pricing': return <DrugPriceHistoryList />;
    case 'returns': return <ReturnList />;
    case 'sales': return <SaleList />;
    case 'users': return <UserManagementPage />;
    default: return <Dashboard />;
  }
}

function PharmacyPages({ page }: PageProps) {
  switch (page) {
    case 'orders': return <OrderList />;
    case 'drugs': return <DrugList />;
    case 'prescriptions': return <PrescriptionList />;
    case 'sales': return <SaleList />;
    default: return <Dashboard />;
  }
}

function SupplierPages({ page }: PageProps) {
  switch (page) {
    case 'orders': return <OrderList />;
    case 'shipments': return <ShipmentList />;
    case 'invoices': return <InvoiceList />;
    default: return <Dashboard />;
  }
}

function WarehousePages({ page }: PageProps) {
  switch (page) {
    case 'warehouses': return <WarehouseList />;
    case 'inventories': return <InventoryList />;
    case 'shipments': return <ShipmentList />;
    default: return <Dashboard />;
  }
}

function AppContent() {
  const params = useParams<{ role?: string; page?: string }>();
  const role = params.role || getRole();
  const page = params.page;

  if (!role || !isAuthenticated()) {
    return <LoginPage />;
  }

  let content: React.ReactNode;
  let LayoutComponent: React.FC<{ children: React.ReactNode }> = AdminLayout;

  switch (role) {
    case 'admin':
      content = <AdminPages page={page} />;
      break;
    case 'pharmacy':
      content = <PharmacyPages page={page} />;
      LayoutComponent = PharmacyLayout;
      break;
    case 'supplier':
      content = <SupplierPages page={page} />;
      LayoutComponent = SupplierLayout;
      break;
    case 'warehouse':
      content = <WarehousePages page={page} />;
      LayoutComponent = WarehouseLayout;
      break;
    default:
      content = <Dashboard />;
  }

  return <LayoutComponent>{content}</LayoutComponent>;
}

export default function App() {
  return (
    <ConfigProvider theme={mediflowTheme}>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/:role" element={<AppContent />} />
        <Route path="/:role/:page" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}
