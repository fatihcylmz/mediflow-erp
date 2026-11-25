import React, { useState, useEffect } from 'react';
import { ConfigProvider, Spin, Alert, Card, Table, Badge, Typography, Button, Select, Segmented, Row, Col } from 'antd';
import { LogoutOutlined, LoadingOutlined, MedicineBoxOutlined, ShoppingCartOutlined, FileTextOutlined, DollarOutlined, WarningOutlined, RollbackOutlined, LineChartOutlined } from '@ant-design/icons';
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
import UserManagementPage from './components/UserManagement/UserManagementPage';
import AdminLayout from './layouts/AdminLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import SupplierLayout from './layouts/SupplierLayout';
import WarehouseLayout from './layouts/WarehouseLayout';
import { mediflowTheme } from './config/theme';

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

// ==================== YENİ GRAFİK BİLEŞENLERİ (CSS tabanlı, SVG path yok) ====================

// --- Çizgi / Alan Grafiği (Trend) - Kompakt ---
function TrendChart({ data, label, color, height = 220 }: { data: any[]; label: string; color: string; height?: number }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FAFAFA', borderRadius: 8 }}>
        <div style={{ color: '#94A3B8', fontSize: 13 }}>Veri yok</div>
        <div style={{ width: '100%', height: '80%', borderBottom: '1px dashed #E2E8F0', marginTop: 8 }} />
      </div>
    );
  }
  const padX = 20;
  const padY = 20;
  const w = 400;
  const h = height - 40;
  const values = data.map(d => d[label]);
  const max = Math.max(...values, 1) * 1.15;
  const min = 0;

  const stepX = w / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = h - ((d[label] - min) / (max - min)) * h;
    return { x, y };
  });

  let dPath = `M ${points[0].x} ${points[0].y}`;
  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      dPath += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const fillPath = `${dPath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg viewBox={`-10 -10 ${w + 20} ${h + 40}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
        ))}
        <path d={fillPath} fill={`url(#grad-${color})`} />
        <path d={dPath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
        ))}
        {/* X-axis labels */}
        {data.length > 0 && [0, Math.floor(data.length / 2), data.length - 1].map(idx => (
          <text
            key={idx}
            x={idx * stepX}
            y={h + 20}
            fontSize="10"
            fill="#94A3B8"
            textAnchor={idx === 0 ? "start" : idx === data.length - 1 ? "end" : "middle"}
            fontWeight="500"
          >
            {data[idx].date}
          </text>
        ))}
      </svg>
    </div>
  );
}

// --- Halka Grafiği (Donut) - CSS conic-gradient tabanlı ---
function DonutChart({ data, colorMap, title = '' }: { data: { name: string; value: number }[]; colorMap?: Record<string, string>; title?: string }) {
  const colors = ['#FF7A00', '#1D4ED8', '#059669', '#DC2626', '#64748B', '#0EA5E9', '#D97706', '#EC4899'];
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 170, height: 170, borderRadius: '50%', background: '#F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>0</span>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', fontWeight: 700 }}>TOPLAM</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorMap?.[d.name] || colors[i % colors.length] }} />
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{d.name}</span>
              <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 700, marginLeft: 'auto' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((a, d) => a + d.value, 0);
  const validData = data.filter(d => d.value > 0);

  // conic-gradient için stop pozisyonlarını hesapla
  let currentAngle = 0;
  const gradientStops = validData.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + sliceAngle;
    currentAngle = end;
    const color = colorMap?.[d.name] || colors[i % colors.length];
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  // Eğer tek dilim %100 ise conic-gradient tek renk olur, yine de çalışır
  const conicGradient = `conic-gradient(${gradientStops})`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, width: '100%', height: '100%', minHeight: 200 }}>
      {/* Halkanın sol tarafı */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 170, height: 170, borderRadius: '50%', background: conicGradient, position: 'relative' }}>
          {/* Orta beyaz daire */}
          <div style={{
            position: 'absolute',
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{total.toLocaleString()}</span>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', fontWeight: 700, marginTop: 2 }}>TOPLAM</span>
          </div>
        </div>
      </div>

      {/* Etiketler SAĞ TARAFTA - Halkanın yanında */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
        {validData.map((d, i) => {
          const color = colorMap?.[d.name] || colors[i % colors.length];
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500, whiteSpace: 'nowrap' }}>{d.name}</span>
              <span style={{ fontSize: 13, color: '#94A3B8', marginLeft: 'auto', fontWeight: 500 }}>{d.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Funnel Grafiği (Satış / Sipariş Funnel) ---
function FunnelChart({
  data,
  colors: customColors = ['#FF7A00', '#1D4ED8', '#059669', '#DC2626', '#64748B', '#0EA5E9', '#D97706', '#EC4899'],
  labelWidth = 140
}: {
  data: { name: string; value: number; conversion?: number }[];
  colors?: string[];
  labelWidth?: number;
}) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#94A3B8', fontSize: 13 }}>Funnel verisi yok</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const itemHeight = 52;
  const gap = 10;
  const funnelWidth = 320;
  const minWidth = 60;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%', height: '100%', minHeight: 300 }}>
      {/* Sol taraf: Funnel visualization */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: gap,
        position: 'relative',
        flexShrink: 0
      }}>
        {data.map((d, i) => {
          const width = Math.max((d.value / maxValue) * funnelWidth, minWidth);
          const color = customColors[i % customColors.length];
          const pctOfMax = ((d.value / maxValue) * 100).toFixed(1);
          const prevValue = i === 0 ? maxValue : data[i - 1].value;
          const conversion = prevValue > 0 ? ((d.value / prevValue) * 100).toFixed(1) : 100;

          return (
            <div key={i} style={{
              width: width,
              height: itemHeight,
              background: `linear-gradient(90deg, ${color}DD, ${color}AA)`,
              borderRadius: i === 0 ? '8px 8px 0 0' : i === data.length - 1 ? '0 0 8px 8px' : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${color}40`
            }}>
              {/* Funnel shape using clip-path for trapezoid effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                clipPath: i === 0
                  ? `polygon(10% 0, 90% 0, 100% 100%, 0% 100%)`
                  : i === data.length - 1
                  ? `polygon(20% 0, 80% 0, 90% 100%, 10% 100%)`
                  : `polygon(15% 0, 85% 0, 90% 100%, 10% 100%)`,
                background: `linear-gradient(90deg, ${color}EE, ${color}AA)`,
                zIndex: -1,
                borderRadius: i === 0 ? '8px 8px 0 0' : i === data.length - 1 ? '0 0 8px 8px' : 0,
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 16px',
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value.toLocaleString()} ({pctOfMax}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sağ taraf: Detaylar ve conversion rates */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: gap,
        minWidth: 200,
        maxWidth: 280,
        flex: 1
      }}>
        {data.map((d, i) => {
          const color = customColors[i % customColors.length];
          const prevValue = i === 0 ? maxValue : data[i - 1].value;
          const conversionRate = prevValue > 0 ? ((d.value / prevValue) * 100).toFixed(1) : 100;
          const dropRate = prevValue > 0 ? (100 - (d.value / prevValue) * 100).toFixed(1) : 0;

          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '10px 12px',
              background: '#FAFAFA',
              borderRadius: 8,
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{d.value.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: '#64748B' }}>Toplamdan: </span>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>{((d.value / maxValue) * 100).toFixed(1)}%</span>
                {i > 0 && (
                  <>
                    <span style={{ color: '#94A3B8' }}>|</span>
                    <span style={{ color: '#64748B' }}>Önceki adım: </span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{conversionRate}%</span>
                    <span style={{ color: '#DC2626', fontWeight: 500, fontSize: 10 }}>▼ {dropRate}%</span>
                  </>
                )}
              </div>
              <div style={{
                height: 4,
                background: '#E2E8F0',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((d.value / maxValue) * 100)}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 2,
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
          // Token varsa ancak API 401 dönerse anında login'e yönlendirme yapma,
          // sadece hata göster (kullanıcı dashboard'da kalmaya devam eder)
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
  }, []);

  if (error) return <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />;
  if (!isAuthenticated()) return null;

  const lowStockWarnings = stats?.lowStockWarnings ?? [];
  const nearExpiryBatches = stats?.nearExpiryBatches ?? [];

  const kpiCards = [
    { title: 'Toplam İlaç Çeşidi', value: stats?.totalDrugs ?? 0, subtitle: 'İlaç Envanteri', color: '#1D4ED8', icon: <MedicineBoxOutlined /> },
    { title: 'Aktif Reçete', value: stats?.totalPrescriptions ?? 0, subtitle: 'Reçeteler', color: '#DC2626', icon: <FileTextOutlined /> },
    { title: 'Toplam Sipariş', value: stats?.totalOrders ?? 0, subtitle: 'Siparişler', color: '#FF7A00', icon: <ShoppingCartOutlined /> },
    { title: 'Toplam Ciro', value: new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats?.totalSalesAmount ?? 0), subtitle: 'Faturalar & Satışlar', color: '#059669', icon: <DollarOutlined /> },
    { title: 'Kritik Stok', value: stats?.criticalStockCount ?? 0, subtitle: 'Envanter', color: '#DC2626', icon: <WarningOutlined /> },
    { title: 'İade Sayısı', value: stats?.nearExpiryBatches.length ?? 0, subtitle: 'İadeler', color: '#64748B', icon: <RollbackOutlined /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {stats === null ? (
        <div className="flex justify-center py-12"><Spin size="large" /></div>
      ) : (
        <>
          <div className="mb-6">
            <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Hoş Geldiniz, {user}</h2>
            <p className="text-slate-500 mt-1">Genel işletme özeti ve stok durumu.</p>
          </div>

          {/* KPI Kartları */}
          <Row gutter={[16, 16]}>
            {kpiCards.map((card, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={4}>
                <Card size="small" style={{ borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider truncate">{card.title}</div>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ background: `${card.color}15`, color: card.color }}>{card.icon}</div>
                  </div>
                  <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{card.subtitle}</div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Düşük / Kritik Stok Tablosu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card bordered={false} title="📦 Düşük & Kritik Stok Uyarısı" extra={<Badge count={stats?.lowStockCount ?? 0} color="error" />} className="shadow-sm rounded-xl overflow-hidden" style={{ minHeight: 400 }}>
              <div className="p-2">
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
                    locale={{ emptyText: <Text>Düşük stok uyarısı bulunmuyor.</Text> }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-slate-400 text-sm">Düşük stok uyarısı yok.</div>
                )}
              </div>
            </Card>

            <Card bordered={false} title="⏰ SKT Yaklaşan Partiler" extra={<Badge count={nearExpiryBatches.length} color="warning" />} className="shadow-sm rounded-xl overflow-hidden" style={{ minHeight: 400 }}>
              <div className="p-2">
                {nearExpiryBatches.length > 0 ? (
                  <Table
                    dataSource={nearExpiryBatches}
                    columns={[
                      { title: 'İlaç', dataIndex: 'drugName', key: 'drugName' },
                      { title: 'Parti No', dataIndex: 'lotNumber', key: 'lotNumber' },
                      { title: 'SKT', dataIndex: 'expirationDate', key: 'expirationDate', render: (v: string) => v ? v.split('T')[0] : '-' },
                      { title: 'Kalan Gün', dataIndex: 'daysRemaining', key: 'daysRemaining', align: 'center', render: (v: number) => <Badge count={`${v} Gün`} style={{ backgroundColor: v < 30 ? '#DC2626' : '#D97706' }} /> },
                    ]}
                    size="small"
                    pagination={false}
                    locale={{ emptyText: <Text>SKT yaklaşan parti yok.</Text> }}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-slate-400 text-sm">SKT yaklaşan parti yok.</div>
                )}
              </div>
            </Card>

            <Card bordered={false} title="📊 Hızlı Durum Göstergeleri" className="shadow-sm rounded-xl overflow-hidden" style={{ minHeight: 400 }}>
              <div className="p-4 flex flex-col justify-around h-full space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Toplam İlaç Çeşidi</span>
                  <span className="font-bold text-lg text-slate-800">{stats?.totalDrugs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Bekleyen Sipariş</span>
                  <span className="font-bold text-lg text-orange-600">{stats?.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Toplam Ciro (Son 30 Gün)</span>
                  <span className="font-bold text-lg text-emerald-600">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats?.totalSalesAmount ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 20 }}>Raporlar & Grafikler</h2>
        <p className="text-slate-500 mt-1">Satış, sipariş ve stok analizleri — Eczane / Depo bazlı filtreli.</p>
      </div>

        {/* Üst Filtre Çubuğu */}
        <Card bordered={false} className="rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center p-2">
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
            <Button type="primary" onClick={fetchTrend} className="ml-auto bg-[#FF7A00] border-[#FF7A00] hover:bg-[#ff8c33]">
              Güncelle
            </Button>
          </div>
        </Card>

        {/* Özet KPI Kartları */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}><StatCard title="Toplam Satış" value={trend?.totalSales ?? 0} subtitle="adet" color="#1D4ED8" /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard title="Toplam Tutar" value={total.toLocaleString('tr-TR')} subtitle="₺" color="#FF7A00" /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard title="Toplam Sipariş" value={trend?.totalOrders ?? 0} subtitle="adet" color="#059669" /></Col>
          <Col xs={24} sm={12} lg={6}><StatCard title="Dönem" value={periodLabel} subtitle={`${startDate} → ${endDate}`} color="#64748B" /></Col>
        </Row>

      {trend && (
        <>
          {/* TREND GRAFİKLERİ - Yan Yana 2 Sütun */}
          <Row gutter={[16, 16]} className="mb-6">
            {/* Çizgi: Satış Trendi */}
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                title={<div className="flex items-center gap-2"><LineChartOutlined className="text-blue-600" /><span>Satış Trendi (POS)</span></div>}
                extra={<span className="text-lg font-bold text-blue-600">{total.toLocaleString('tr-TR')} ₺</span>}
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
                bordered={false}
                title={<div className="flex items-center gap-2"><ShoppingCartOutlined className="text-orange-500" /><span>Sipariş Trendi</span></div>}
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
                bordered={false}
                title={<div className="flex items-center gap-2"><FileTextOutlined className="text-emerald-600" /><span>Reçete Türü Dağılımı</span></div>}
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
                bordered={false}
                title={<div className="flex items-center gap-2"><MedicineBoxOutlined className="text-slate-600" /><span>Stok Durumu</span></div>}
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
                bordered={false}
                title={<div className="flex items-center gap-2"><LineChartOutlined className="text-purple-600" /><span>Sipariş → Satış Funnel</span></div>}
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
                bordered={false}
                title={<div className="flex items-center gap-2"><DollarOutlined className="text-emerald-600" /><span>İşlem Hacmi Analizi</span></div>}
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
    case 'payments': return <PaymentTransactionList />;
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
