import { useEffect, useState, useMemo } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Tag, Descriptions, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { DonutChart, KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface PaymentTransaction {
  id: string;
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
  feeAmount?: number;
  netAmount?: number;
  paymentDate: string;
  transactionReference: string;
  notes: string;
  status: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  feePercentage?: number;
  isActive: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  status: number;
}

export default function PaymentTransactionList() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, methodRes, invoiceRes] = await Promise.all([
        api.get('/api/app/payment-transaction'),
        api.get('/api/app/payment-method'),
        api.get('/api/app/invoice')
      ]);
      setTransactions(txRes.data.items || []);
      setMethods(methodRes.data.items || []);
      setInvoices(invoiceRes.data.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Ödeme kayıtları yüklenirken hata oluştu.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag icon={<ClockCircleOutlined />} color="orange">Beklemede</Tag>;
      case 1: return <Tag icon={<CheckCircleOutlined />} color="success">Tamamlandı</Tag>;
      case 2: return <Tag icon={<CloseCircleOutlined />} color="error">Başarısız</Tag>;
      case 3: return <Tag color="blue">İade Edildi</Tag>;
      case 4: return <Tag color="default">İptal Edildi</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 0 });
    setIsModalVisible(true);
  };

  const showEditModal = (record: PaymentTransaction) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await api.put(`/api/app/payment-transaction/${editingId}`, values);
        message.success('Ödeme kaydı güncellendi.');
      } else {
        await api.post('/api/app/payment-transaction', values);
        message.success('Yeni ödeme kaydı oluşturuldu.');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      // Hata zaten global interceptor'da gösteriliyor
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/app/payment-transaction/${id}`);
      message.success('Ödeme kaydı silindi.');
      fetchData();
    } catch (error: any) {
      // Hata zaten global interceptor'da gösteriliyor
    }
  };

  // Memoized computed values
  const totalAmount = useMemo(() => transactions.reduce((sum, t) => sum + (t.amount || 0), 0), [transactions]);
  const completedCount = useMemo(() => transactions.filter(t => t.status === 1).length, [transactions]);
  const pendingCount = useMemo(() => transactions.filter(t => t.status === 0).length, [transactions]);

  // Donut chart data - payment method distribution
  const methodDistribution = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    transactions.forEach(t => {
      const m = methods.find(m => m.id === t.paymentMethodId);
      const name = m?.name || 'Bilinmeyen';
      const existing = map.get(name);
      map.set(name, { name, value: (existing?.value || 0) + (t.amount || 0) });
    });
    return Array.from(map.values());
  }, [transactions, methods]);

  // Donut chart data - collection status distribution
  const statusDistribution = useMemo(() => {
    const map = new Map<number, { name: string; value: number }>();
    const statusLabels: Record<number, string> = {
      0: 'Beklemede',
      1: 'Tamamlandı',
      2: 'Başarısız',
      3: 'İade Edildi',
      4: 'İptal Edildi'
    };
    const statusColors: Record<number, string> = {
      0: '#FAAD14',
      1: '#52C41A',
      2: '#FF4D4F',
      3: '#1890FF',
      4: '#8C8C8C'
    };
    transactions.forEach(t => {
      const existing = map.get(t.status);
      map.set(t.status, { name: statusLabels[t.status] || 'Bilinmiyor', value: (existing?.value || 0) + 1 });
    });
    return Array.from(map.values());
  }, [transactions]);

  const columns = [
    {
      title: 'Fatura No',
      key: 'invoice',
      render: (_: any, r: PaymentTransaction) => {
        const inv = invoices.find(i => i.id === r.invoiceId);
        return inv ? <Text strong style={{ color: '#1D4ED8' }}>{inv.invoiceNumber}</Text> : <Text type="secondary">{r.invoiceId?.slice(0, 8)}...</Text>;
      }
    },
    {
      title: 'Ödeme Yöntemi',
      key: 'method',
      render: (_: any, r: PaymentTransaction) => {
        const m = methods.find(m => m.id === r.paymentMethodId);
        return m ? <Tag color="geekblue">{m.name}</Tag> : <Text type="secondary">-</Text>;
      }
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => <Text strong style={{ color: '#FF7A00' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)}</Text>
    },
    {
      title: 'Ücret',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      render: (v: number) => v ? <Text type="secondary">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)}</Text> : '-'
    },
    {
      title: 'Net Tutar',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (v: number) => v ? <Text strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)}</Text> : '-'
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (d: string) => d ? dayjs(d).format('DD.MM.YYYY HH:mm') : '-'
    },
    {
      title: 'Referans No',
      dataIndex: 'transactionReference',
      key: 'ref',
      render: (v: string) => v || '-'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => getStatusTag(s)
    },
    {
      title: 'Notlar',
      dataIndex: 'notes',
      key: 'notes',
      render: (v: string) => v || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, r: PaymentTransaction) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => showEditModal(r)} />
          <Popconfirm title="Bu ödeme kaydını silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const currencyFormat = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 style={{ color: '#0F172A', fontWeight: 700, margin: 0, fontSize: 22 }}>
            <DollarOutlined style={{ color: '#FF7A00', marginRight: 10, verticalAlign: 'middle' }} />
            Ödeme İşlemleri
          </h2>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>Tahsilat ve ödeme kayıtlarını görüntüleyin, yönetin ve analiz edin.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large"
          style={{ background: 'linear-gradient(135deg, #FF7A00, #FF9E4D)', borderColor: 'transparent', borderRadius: 10 }}>
          Yeni Ödeme Kaydı
        </Button>
      </div>

      {/* KPI Cards - Modern White Surface */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Toplam İşlem"
            value={transactions.length}
            subtitle="Kayıt"
            color="#FF7A00"
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Toplam Tutar"
            value={currencyFormat(totalAmount)}
            subtitle="İşlem hacmi"
            color="#1D4ED8"
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Tamamlanan"
            value={completedCount}
            subtitle="Başarılı işlem"
            color="#059669"
            icon={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title="Bekleyen"
            value={pendingCount}
            subtitle="Onay bekliyor"
            color="#FAAD14"
            icon={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      {/* Charts Row - Donut Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Payment Method Distribution */}
        <Col xs={24} lg={12}>
          <Card
            className="shadow-sm rounded-xl overflow-hidden"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={<div className="flex items-center gap-2"><PieChartOutlined style={{ color: '#7C3AED' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Ödeme Yöntemi Dağılımı</span></div>}
          >
            <div style={{ height: 280 }}>
              {loading ? (
                <div className="flex h-full items-center justify-center"><div className="text-slate-400">Yükleniyor...</div></div>
              ) : methodDistribution.length > 0 ? (
                <DonutChart data={methodDistribution} title="TOPLAM" size={160} />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Ödeme yöntemi verisi yok</div>
              )}
            </div>
          </Card>
        </Col>

        {/* Collection Status Distribution */}
        <Col xs={24} lg={12}>
          <Card
            className="shadow-sm rounded-xl overflow-hidden"
            styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '12px 20px' }, body: { padding: '16px 20px' } }}
            title={<div className="flex items-center gap-2"><LineChartOutlined style={{ color: '#059669' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Tahsilat Durumu Dağılımı</span></div>}
          >
            <div style={{ height: 280 }}>
              {loading ? (
                <div className="flex h-full items-center justify-center"><div className="text-slate-400">Yükleniyor...</div></div>
              ) : statusDistribution.length > 0 ? (
                <DonutChart data={statusDistribution} title="TOPLAM" size={160} />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Durum verisi yok</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table Card - Modern White Surface */}
      <Card
        className="shadow-sm rounded-xl overflow-hidden"
        styles={{ header: { borderBottom: '1px solid #F1F5F9', padding: '16px 20px' }, body: { padding: 0 } }}
        title={<div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Ödeme İşlemleri Listesi</div>}
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered={false}
          size="middle"
          pagination={{ pageSize: 15, showSizeChanger: true }}
          locale={{ emptyText: <Text type="secondary">Ödeme kaydı bulunmuyor.</Text> }}
        />
      </Card>

      {/* MODAL */}
      <Modal
        title={editingId ? "Ödeme Kaydını Düzenle" : "Yeni Ödeme Kaydı Oluştur"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="invoiceId" label="Fatura" rules={[{ required: true, message: 'Fatura seçiniz' }]}>
            <Select placeholder="Fatura Seçin" showSearch optionFilterProp="children">
              {invoices.filter(i => i.status !== 1).map(inv => (
                <Select.Option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {currencyFormat(inv.grandTotal)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="paymentMethodId" label="Ödeme Yöntemi" rules={[{ required: true, message: 'Ödeme yöntemi seçiniz' }]}>
            <Select placeholder="Ödeme Yöntemi Seçin" showSearch optionFilterProp="children">
              {methods.filter(m => m.isActive).map(m => (
                <Select.Option key={m.id} value={m.id}>{m.name} {(m.feePercentage ? `(${m.feePercentage}% ücret)` : '')}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="amount" label="Tutar (₺)" rules={[{ required: true, message: 'Tutar giriniz' }]}>
            <InputNumber precision={2} min={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="feeAmount" label="İşlem Ücreti (₺)">
            <InputNumber precision={2} min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="paymentDate" label="Ödeme Tarihi" rules={[{ required: true, message: 'Tarih seçiniz' }]}>
            <Select.Option key="now" value={dayjs().format('YYYY-MM-DDTHH:mm:ss')}>Şimdi</Select.Option>
          </Form.Item>

          <Form.Item name="transactionReference" label="Referans / İşlem No">
            <Input placeholder="Banka referans numarası vb." style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="Durum" rules={[{ required: true, message: 'Durum seçiniz' }]}>
            <Select placeholder="Durum Seçin" style={{ width: '100%' }}>
              <Select.Option value={0}>Beklemede</Select.Option>
              <Select.Option value={1}>Tamamlandı</Select.Option>
              <Select.Option value={2}>Başarısız</Select.Option>
              <Select.Option value={3}>İade Edildi</Select.Option>
              <Select.Option value={4}>İptal Edildi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="İsteğe bağlı notlar..." style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
            <Button type="default" onClick={() => setIsModalVisible(false)}>İptal</Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#FF7A00', borderColor: '#FF7A00' }}>
              {editingId ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}