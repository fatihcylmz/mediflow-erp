import React, { useState, useEffect } from 'react';
import { ConfigProvider, Spin, Alert, Card, Table, Badge, Typography, Button, Select, Segmented, Row, Col } from 'antd';
import { LogoutOutlined, LoadingOutlined, MedicineBoxOutlined, ShoppingCartOutlined, FileTextOutlined, DollarOutlined, WarningOutlined, RollbackOutlined, LineChartOutlined, ClockCircleOutlined, BarChartOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
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
import PaymentTransactionList from './pages/PaymentTransactionList';
import PharmacyDashboard from './pages/PharmacyDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import UserManagementPage from './components/UserManagement/UserManagementPage';
import AdminLayout from './layouts/AdminLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import SupplierLayout from './layouts/SupplierLayout';
import WarehouseLayout from './layouts/WarehouseLayout';
import { mediflowTheme } from './config/theme';
import { TrendChart, DonutChart, FunnelChart, KPICard } from './components/charts/DashboardCharts';

// Auth helpers
const getRole = () => localStorage.getItem('role') as 'admin' | 'pharmacy' | 'supplier' | 'warehouse' | null;
const isAuthenticated = () => !!getRole() && !!localStorage.getItem('token');

// Auth koruması: token yoksa login sayfasına yönlendir
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

// ==================== DASHBOARD: ÖZET ====================
function DashboardOzet() {
  const user = localStorage.getItem('username') || 'Kullanıcı';
  const [stats, setStats] = useState<{
    totalDrugs: number;
    pendingOrders: number;
    totalOrders: number;
    totalSalesAmount: number;
    totalPrescriptions: number;
    criticalStockCount: number;
    lowStockCount: number;
    lowStockWarnings: Array<{
      drugId: string; drugName: string; currentStock: number; minimumStock: number; shortage: number;
    }>;
    nearExpiryBatches: Array<{
      batchId: string; drugName: string; lotNumber: string; expirationDate: string; daysRemaining: number; quantity: number;
    }>;
  } | null>(null);
  const [returnCount, setReturnCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requireAuth()) return;
    setLoading(true);
    api
      .post<{ data: any }>('/api/app/dashboard/get-stats')
      .then(r => {
        const d = r.data?.data ?? r.data;
        setStats({
          totalDrugs: d.totalDrugs ?? 0,
          pendingOrders: d.pendingOrders ?? 0,
          totalOrders: d.totalOrders ?? 0,
          totalSalesAmount: d.totalSalesAmount ?? 0,
          totalPrescriptions: d.totalPrescriptions ?? 0,
          criticalStockCount: d.criticalStockCount ?? 0,
          lowStockCount: d.lowStockCount ?? 0,
          lowStockWarnings: d.lowStockWarnings ?? [],
          nearExpiryBatches: d.nearExpiryBatches ?? [],
        });
      })
      .catch((err: any) => {
        if (err?.response?.status === 401) {
          if (!localStorage.getItem('token')) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
          }
          setError('Oturumunuz süresi dolmuş. Lütfen tekrar giriş yapın.');
          return;
        }
        setError('Özet verileri yüklenemedi');
      })
      .finally(() => setLoading(false));

    // İade sayısını da getir
    api.get<any>('/api/app/return?skipCount=0&maxResultCount=1')
      .then(r => {
        const total = r.data?.data?.totalCount ?? r.data?.totalCount ?? 0;
        setReturnCount(typeof total === 'number' ? total : (r.data?.items?.length ?? 0));
      })
      .catch(() => setReturnCount(0));
  }, []);

  if (error) return <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />;
  if (!isAuthenticated()) return null;

  const lowStockWarnings = stats?.lowStockWarnings ?? [];
  const nearExpiryBatches = stats?.nearExpiryBatches ?? [];

  return (
    <div className="space-y-6 p-6">
      {stats === null ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <div className="mb-6">
            <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 22 }}>Hoş Geldiniz, {user}</h2>
            <p style={{ color: '#64748B', margin: '6px 0 0', fontSize: 14 }}>Genel işletme özeti ve stok durumu.</p>
          </div>

          {/* KPI Kartları - Modern ERP Style */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="Toplam İlaç Çeşidi" value={stats?.totalDrugs ?? 0} subtitle="İlaç Envanteri" color="#1D4ED8" icon={<MedicineBoxOutlined />} trend={5} trendLabel="vs ay önce" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="Aktif Reçete" value={stats?.totalPrescriptions ?? 0} subtitle="Reçeteler" color="#DC2626" icon={<FileTextOutlined />} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="Toplam Sipariş" value={stats?.totalOrders ?? 0} subtitle="Siparişler" color="#FF7A00" icon={<ShoppingCartOutlined />} trend={12} trendLabel="vs ay önce" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="Toplam Ciro" value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats?.totalSalesAmount ?? 0)} subtitle="Faturalar & Satışlar" color="#059669" icon={<DollarOutlined />} trend={8} trendLabel="vs ay önce" />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="Kritik Stok" value={stats?.criticalStockCount ?? 0} subtitle="Envanter" color="#DC2626" icon={<WarningOutlined />} />
            </Col>
            <Col xs={24} sm={12} md={8} lg={4}>
              <KPICard title="İade Sayısı" value={returnCount} subtitle="İadeler" color="#64748B" icon={<RollbackOutlined />} />
            </Col>
          </Row>

          {/* Düşük / Kritik Stok & SKT Kartları */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <Card
              className="shadow-sm rounded-xl overflow-hidden"
              styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '16px 20px' }, body: { padding: '16px 20px' } }}
              title={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7', color: '#D97706' }}>
                    <WarningOutlined style={{ fontSize: 16 }} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Düşük & Kritik Stok</span>
                </div>
              }
              extra={<Badge count={stats?.lowStockCount ?? 0} color="error" />}
              style={{ minHeight: 380 }}
            >
              {lowStockWarnings.length > 0 ? (
                <Table
                  dataSource={lowStockWarnings.slice(0, 8)}
                  columns={[
                    { title: 'İlaç', dataIndex: 'drugName', key: 'drugName' },
                    { title: 'Mevcut', dataIndex: 'currentStock', key: 'currentStock', align: 'center' },
                    { title: 'Minimum', dataIndex: 'minimumStock', key: 'minimumStock', align: 'center' },
                    { title: 'Eksik', dataIndex: 'shortage', key: 'shortage', align: 'center', render: (v: number) => <Text style={{ color: '#DC2626', fontWeight: 600 }}>{v}</Text> },
                  ]}
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Text type="secondary">Düşük stok uyarısı bulunmuyor.</Text> }}
                />
              ) : (
                <div className="flex h-60 items-center justify-center text-slate-400 text-sm">Düşük stok uyarısı yok.</div>
              )}
            </Card>

            <Card
              className="shadow-sm rounded-xl overflow-hidden"
              styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '16px 20px' }, body: { padding: '16px 20px' } }}
              title={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    <ClockCircleOutlined style={{ fontSize: 16 }} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>SKT Yaklaşan Partiler</span>
                </div>
              }
              extra={<Badge count={nearExpiryBatches.length} color="warning" />}
              style={{ minHeight: 380 }}
            >
              {nearExpiryBatches.length > 0 ? (
                <Table
                  dataSource={nearExpiryBatches}
                  columns={[
                    { title: 'İlaç', dataIndex: 'drugName', key: 'drugName' },
                    { title: 'Parti No', dataIndex: 'lotNumber', key: 'lotNumber' },
                    { title: 'SKT', dataIndex: 'expirationDate', key: 'expirationDate', render: (v: string) => v ? v.split('T')[0] : '-' },
                    { title: 'Kalan Gün', dataIndex: 'daysRemaining', key: 'daysRemaining', align: 'center', render: (v: number) => <Badge count={`${v} Gün`} style={{ backgroundColor: v < 30 ? '#FEE2E2' : '#FEF3C7', color: v < 30 ? '#DC2626' : '#D97706', border: 'none' }} /> },
                  ]}
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Text type="secondary">SKT yaklaşan parti yok.</Text> }}
                />
              ) : (
                <div className="flex h-60 items-center justify-center text-slate-400 text-sm">SKT yaklaşan parti yok.</div>
              )}
            </Card>

            <Card
              className="shadow-sm rounded-xl overflow-hidden"
              styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '16px 20px' }, body: { padding: '16px 20px' } }}
              title={
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                    <BarChartOutlined style={{ fontSize: 16 }} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Hızlı Durum</span>
                </div>
              }
              style={{ minHeight: 380 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-sm font-medium text-slate-600">Toplam İlaç Çeşidi</span>
                  <span className="font-bold text-lg text-slate-800">{stats?.totalDrugs}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-sm font-medium text-slate-600">Bekleyen Sipariş</span>
                  <span className="font-bold text-lg text-orange-600">{stats?.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-sm font-medium text-slate-600">Toplam Ciro (Son 30 Gün)</span>
                  <span className="font-bold text-lg text-emerald-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats?.totalSalesAmount ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-sm font-medium text-slate-600">Kritik Stok Uyarısı</span>
                  <span className="font-bold text-lg text-red-600">{stats?.criticalStockCount}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== DASHBOARD: GRAFİKLER (TAB 2) ====================
function DashboardGrafikler() {
  const [trend, setTrend] = useState<{
    dailySales: Array<{ date: string; amount: number }>;
    dailyOrders: Array<{ date: string; count: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
    stockDistribution: Array<{ name: string; value: number }>;
    totalSales: number;
    totalSalesAmount: number;
    totalOrders: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pharmacies, setPharmacies] = useState<Array<{ id: string; name: string }>>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const fetchLists = () => {
    // Eczane listesi
    api.get<any>('/api/app/pharmacy?skipCount=0&maxResultCount=100')
      .then(r => {
        const items = r?.data?.data?.items ?? r?.data?.items ?? [];
        setPharmacies(items.map((p: any) => ({ id: p.id, name: p.name })));
      })
      .catch(() => setPharmacies([]));

    // Depo listesi
    api.get<any>('/api/app/warehouse?skipCount=0&maxResultCount=100')
      .then(r => {
        const items = r?.data?.data?.items ?? r?.data?.items ?? [];
        setWarehouses(items.map((w: any) => ({ id: w.id, name: w.name })));
      })
      .catch(() => setWarehouses([]));
  };

  useEffect(() => {
    if (!requireAuth()) return;
    fetchLists();

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    fetchTrend();
  }, []);

  const fetchTrend = () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedPharmacyId) params.append('pharmacyId', selectedPharmacyId);
    if (selectedWarehouseId) params.append('warehouseId', selectedWarehouseId);

    api
      .get<{ data: any }>(`/api/app/dashboard/trend?${params.toString()}`)
      .then(r => {
        const d = r.data?.data ?? r.data;
        setTrend({
          dailySales: d.dailySales?.map((s: any) => ({ date: s.date, amount: s.amount ?? 0 })) ?? [],
          dailyOrders: d.dailyOrders?.map((o: any) => ({ date: o.date, count: o.count ?? 0 })) ?? [],
          categoryDistribution: d.categoryDistribution?.map((c: any) => ({ name: c.name, value: c.value ?? 0 })) ?? [],
          stockDistribution: d.stockDistribution?.map((s: any) => ({ name: s.name, value: s.value ?? 0 })) ?? [],
          totalSales: d.totalSales ?? 0,
          totalSalesAmount: d.totalSalesAmount ?? 0,
          totalOrders: d.totalOrders ?? 0,
        });
      })
      .catch((err: any) => {
        if (err?.response?.status === 401) {
          if (!localStorage.getItem('token')) {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
          }
          setError('Oturumunuz süresi dolmuş. Lütfen tekrar giriş yapın.');
          return;
        }
        setError('Grafik verileri yüklenemedi');
      })
      .finally(() => setLoading(false));
  };

  if (error) return <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />;
  if (!isAuthenticated()) return null;

  const total = trend?.totalSalesAmount ?? 0;
  const maxSales = trend?.dailySales.reduce((m, s) => Math.max(m, s.amount), 0) || 1;
  const maxOrders = trend?.dailyOrders.reduce((m, o) => Math.max(m, o.count), 0) || 1;
  const maxStock = trend?.stockDistribution.reduce((m, s) => Math.max(m, s.value), 0) || 1;
  const maxCat = trend?.categoryDistribution.reduce((m, c) => Math.max(m, c.value), 0) || 1;

  const periodLabel = period === 'day' ? 'Günlük' : period === 'week' ? 'Haftalık' : period === 'month' ? 'Aylık' : 'Yıllık';

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 22 }}>Raporlar & Grafikler</h2>
        <p style={{ color: '#64748B', margin: '6px 0 0', fontSize: 14 }}>Satış, sipariş ve stok analizleri — Eczane / Depo bazlı filtreli.</p>
      </div>

      {/* Üst Filtre Çubuğu */}
      <Card className="rounded-xl border border-[#E2E8F0] shadow-sm mb-6" styles={{ body: { padding: '16px 20px' } }}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#475569]">Dönem:</span>
            <Segmented
              options={[
                { label: 'Günlük', value: 'day' },
                { label: 'Haftalık', value: 'week' },
                { label: 'Aylık', value: 'month' },
                { label: 'Yıllık', value: 'year' },
              ]}
              value={period}
              onChange={val => { setPeriod(val as any); fetchTrend(); }}
            />
          </div>
          <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#475569]">Eczane:</span>
            <Select
              value={selectedPharmacyId || undefined}
              onChange={val => { setSelectedPharmacyId(val as string); fetchTrend(); }}
              allowClear
              showSearch
              placeholder="Tüm Eczaneler"
              style={{ width: 180 }}
            >
              {pharmacies.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#475569]">Depo:</span>
            <Select
              value={selectedWarehouseId || undefined}
              onChange={val => { setSelectedWarehouseId(val as string); fetchTrend(); }}
              allowClear
              showSearch
              placeholder="Tüm Depolar"
              style={{ width: 180 }}
            >
              {warehouses.map(w => (
                <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
              ))}
            </Select>
          </div>
          <Button type="primary" onClick={fetchTrend} loading={loading}
            style={{ background: '#FF7A00', borderColor: '#FF7A00', marginLeft: 'auto' }}>
            Güncelle
          </Button>
        </div>
      </Card>

      {/* Özet KPI Kartları - Modern */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Toplam Satış" value={trend?.totalSales ?? 0} subtitle="adet" color="#1D4ED8" icon={<ShoppingCartOutlined />} trend={6} trendLabel="vs önceki dönem" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Toplam Tutar" value={new Intl.NumberFormat('tr-TR').format(total)} subtitle="₺" color="#FF7A00" icon={<DollarOutlined />} trend={11} trendLabel="vs önceki dönem" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Toplam Sipariş" value={trend?.totalOrders ?? 0} subtitle="sipariş" color="#059669" icon={<FileTextOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard title="Dönem" value={periodLabel} subtitle={`${startDate || '—'} → ${endDate || '—'}`} color="#64748B" icon={<LineChartOutlined />} />
        </Col>
      </Row>

      {trend && (
        <>
          {/* TREND GRAFİKLERİ - Yan Yana 2 Sütun */}
          <Row gutter={[16, 16]} className="mb-6">
            {/* Çizgi: Satış Trendi */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><LineChartOutlined style={{ color: '#2563EB' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Satış Trendi (POS)</span></div>}
                extra={<span className="text-lg font-bold" style={{ color: '#1D4ED8' }}>{total.toLocaleString('tr-TR')} ₺</span>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 280 }}
              >
                <div className="p-4" style={{ height: 220 }}>
                  {loading ? <div className="flex h-full items-center justify-center"><Spin size="large" /></div> : <TrendChart data={trend.dailySales} label="amount" color="#1D4ED8" />}
                </div>
              </Card>
            </Col>

            {/* Çizgi: Sipariş Trendi */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><ShoppingCartOutlined style={{ color: '#FF7A00' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sipariş Trendi</span></div>}
                extra={<span className="text-lg font-bold text-orange-500">{trend.totalOrders}</span>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 280 }}
              >
                <div className="p-4" style={{ height: 220 }}>
                  {loading ? <div className="flex h-full items-center justify-center"><Spin size="large" /></div> : <TrendChart data={trend.dailyOrders} label="count" color="#FF7A00" />}
                </div>
              </Card>
            </Col>
          </Row>

          {/* HALKA GRAFİKLERİ - Yan Yana 2 Sütun */}
          <Row gutter={[16, 16]} className="mb-6">
            {/* Pasta: Reçete Dağılımı */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><FileTextOutlined style={{ color: '#059669' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Reçete Türü Dağılımı</span></div>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 300 }}
              >
                <div className="p-4" style={{ height: 240 }}>
                  <DonutChart data={trend.categoryDistribution} />
                </div>
              </Card>
            </Col>

            {/* Pasta: Stok Durumu */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><MedicineBoxOutlined style={{ color: '#64748B' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Stok Durumu</span></div>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 300 }}
              >
                <div className="p-4" style={{ height: 240 }}>
                  <DonutChart data={trend.stockDistribution} colorMap={{ "Yeterli Stok": "#059669", "Düşük Stok": "#FF7A00", "Kritik Stok": "#DC2626" }} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* FUNNEL GRAFİĞİ - Sipariş → Satış Funnel */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><LineChartOutlined style={{ color: '#7C3AED' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Sipariş → Satış Funnel</span></div>}
                extra={<span className="text-sm text-slate-500">Conversion</span>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 400 }}
              >
                <div className="p-4" style={{ height: 340 }}>
                  {loading ? (
                    <div className="flex h-full items-center justify-center"><Spin size="large" /></div>
                  ) : (
                    <FunnelChart
                      data={[
                        { name: 'Toplam Sipariş', value: trend.totalOrders },
                        { name: 'Tamamlanan', value: Math.round(trend.totalOrders * 0.8) },
                        { name: 'Onaylanan', value: Math.round(trend.totalOrders * 0.6) },
                        { name: 'Sevk Edilen', value: Math.round(trend.totalOrders * 0.4) },
                        { name: 'Teslim Edilen', value: Math.round(trend.totalOrders * 0.3) },
                        { name: 'Tamamlanan Satış', value: trend.totalSales },
                      ]}
                    />
                  )}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
                title={<div className="flex items-center gap-2"><DollarOutlined style={{ color: '#059669' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>İşlem Hacmi Analizi</span></div>}
                extra={<span className="text-sm text-slate-500">Detay</span>}
                className="shadow-sm rounded-xl overflow-hidden"
                style={{ height: 400 }}
              >
                <div className="p-4 space-y-4" style={{ height: 340, overflowY: 'auto' }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Toplam İşlem Hacmi</span>
                      <span className="font-bold text-lg text-emerald-600">{trend.totalSalesAmount.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Ortalama İşlem</span>
                      <span className="font-bold text-lg text-blue-600">{(trend.totalSalesAmount / Math.max(trend.totalSales, 1)).toFixed(0)} ₺</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Sipariş/Satış Oranı</span>
                      <span className="font-bold text-lg text-purple-600">{trend.totalOrders > 0 ? (trend.totalSales / trend.totalOrders * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Dönem Performansı</span>
                      <span className="font-bold text-lg text-orange-600">{periodLabel}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Toplam Sipariş</span>
                      <span className="font-bold text-lg text-slate-800">{trend.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-600">Toplam Satış Adedi</span>
                      <span className="font-bold text-lg text-slate-800">{trend.totalSales}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: any; subtitle?: string; color: string }) {
  return (
    <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{title}</div>
      <div className="text-xl font-bold mt-1" style={{ color }}>{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </Card>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'ozet' | 'grafik'>('ozet');

  return (
    <div className="p-6 space-y-6">
          {/* Üst Bar ve Sekmeler */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
              <p className="text-slate-500 mt-1">Genel işletme özeti ve stok durumu</p>
            </div>
            <Segmented
              options={[
                { label: 'Genel Özet', value: 'ozet' },
                { label: 'Raporlar & Grafikler', value: 'grafik' },
              ]}
              value={activeTab}
              onChange={val => setActiveTab(val as 'ozet' | 'grafik')}
              className="bg-white p-1 rounded-lg border border-[#E2E8F0] shadow-sm"
            />
          </div>

          {activeTab === 'ozet' ? <DashboardOzet /> : <DashboardGrafikler />}
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
    case 'payments': return <PaymentTransactionList />;
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
    case 'returns': return <ReturnList />;
    case 'payments': return <PaymentTransactionList />;
    default: return <PharmacyDashboard />;
  }
}

function SupplierPages({ page }: PageProps) {
  switch (page) {
    case 'orders': return <OrderList />;
    case 'shipments': return <ShipmentList />;
    case 'invoices': return <InvoiceList />;
    case 'payments': return <PaymentTransactionList />;
    default: return <SupplierDashboard />;
  }
}

function WarehousePages({ page }: PageProps) {
  switch (page) {
    case 'warehouses': return <WarehouseList />;
    case 'inventories': return <InventoryList />;
    case 'shipments': return <ShipmentList />;
    case 'drugs': return <DrugList />;
    default: return <WarehouseDashboard />;
  }
}

function AppContent() {
  const params = useParams<{ role?: string; page?: string }>();
  const role = params.role || getRole();
  const page = params.page || 'dashboard';

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
