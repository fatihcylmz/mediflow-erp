import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, Space, Popconfirm, Divider, Row, Col, Avatar, Tooltip, Badge } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PrinterOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, SendOutlined, DollarOutlined, BarcodeOutlined,
  StopOutlined, WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

interface Invoice {
  id: string;
  pharmacyId: string;
  shipmentId: string;
  invoiceNumber: string;
  issueDate?: string;
  issuedDate?: string;
  dueDate: string;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: number;
  items?: any[];
}

interface Pharmacy { id: string; name: string; address?: string; taxNumber?: string; }
interface Shipment { id: string; trackingNumber: string; pharmacyId: string; orderId?: string; status: number; }
interface Drug { id: string; name: string; barcode?: string; }

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Modal State
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // A4 PDF / Görüntüleme Modal State
  const [isPrintModalVisible, setIsPrintModalVisible] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [invoiceRes, pharmacyRes, shipmentRes, drugRes] = await Promise.all([
        api.get('/api/app/invoice'),
        api.get('/api/app/pharmacy'),
        api.get('/api/app/shipment'),
        api.get('/api/app/drug')
      ]);
      setInvoices(invoiceRes.data.items || []);
      setPharmacies(pharmacyRes.data.items || []);
      setShipments(shipmentRes.data.items || []);
      setDrugs(drugRes.data.items || []);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      message.error('Sistem verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      issueDate: dayjs(),
      dueDate: dayjs().add(15, 'day'),
      status: 0,
      taxTotal: 0,
      grandTotal: 0
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Invoice) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : dayjs(),
      dueDate: record.dueDate ? dayjs(record.dueDate) : dayjs().add(15, 'day')
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        issueDate: values.issueDate.toISOString(),
        dueDate: values.dueDate.toISOString()
      };
      if (editingId) {
        await api.put(`/invoice/${editingId}`, payload);
        message.success('Fatura başarıyla güncellendi.');
      } else {
        await api.post('/api/app/invoice', payload);
        message.success('Yeni fatura sisteme eklendi.');
      }
      setIsModalVisible(false);
      fetchInitialData();
    } catch (error) {
      message.error('Fatura kaydedilemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/invoice/${id}`);
      message.success('Fatura silindi.');
      fetchInitialData();
    } catch (error) {
      message.error('Silme işlemi başarısız. Bu faturaya bağlı ödeme veya sipariş olabilir.');
    }
  };

  const handleCancel = async (id: string, invoiceNumber: string) => {
    try {
      await api.post(`/api/app/invoice/${id}/cancel`);
      message.success(`Fatura "${invoiceNumber}" başarıyla iptal edildi.`);
      fetchInitialData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Fatura iptal edilirken hata oluştu.';
      message.error(errorMsg);
    }
  };

  const showPrintModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintModalVisible(true);
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Badge status="processing" text={<Text style={{ color: '#0ea5e9', fontWeight: 600 }}>Taslak</Text>} />;
      case 1: return <Badge status="success" text={<Text style={{ color: '#16a34a' }}>Gönderildi</Text>} />;
      case 2: return <Badge status="warning" text={<Text style={{ color: '#d97706' }}>Ödendi</Text>} />;
      case 3: return <Badge status="error" text={<Text style={{ color: '#dc2626' }}>Vadesi Geçti</Text>} />;
      case 4: return <Badge status="default" text={<Text style={{ color: '#6b7280' }}>İptal Edildi</Text>} />;
      default: return <Tag>{status}</Tag>;
    }
  };

  const getPharmacyName = (pharmacyId: string) => {
    const pharmacy = pharmacies.find(p => p.id === pharmacyId);
    return pharmacy ? pharmacy.name : 'Bilinmeyen';
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes('') ||
    getPharmacyName(invoice.pharmacyId).toLowerCase().includes('')
  );

  const invoiceColumns = [
    {
      title: 'Fatura Bilgisi',
      key: 'info',
      render: (_: any, record: Invoice) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<DollarOutlined />}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', fontSize: 18 }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 14 }}>{record.invoiceNumber}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{getPharmacyName(record.pharmacyId)}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Tarih Aralığı',
      key: 'dates',
      width: 150,
      render: (_: any, record: Invoice) => (
        <div>
          <Text style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ color: '#3b82f6', marginRight: 6 }} />
            {record.issueDate ? dayjs(record.issueDate).format('DD MMM YYYY') : 'Belirtilmemiş'}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            <SendOutlined style={{ color: '#94a3b8', marginRight: 6 }} />
            {record.dueDate ? dayjs(record.dueDate).format('DD MMM YYYY') : 'Belirtilmemiş'}
          </Text>
        </div>
      )
    },
    {
      title: 'Tutarlar',
      key: 'amounts',
      width: 120,
      render: (_: any, record: Invoice) => (
        <div>
          <Text strong style={{ color: '#1e293b' }}>{record.grandTotal.toLocaleString()} ₺</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>KDV: {record.taxTotal.toLocaleString()} ₺</Text>
        </div>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status)
    },
    {
      title: 'Hızlı İşlemler',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: Invoice) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Tooltip title="PDF Görüntüle / İndir">
            <Button
              type="primary"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => showPrintModal(record)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                border: 'none',
                borderRadius: 8
              }}
            >
              PDF / Görüntüle
            </Button>
          </Tooltip>
          <Space size={4} style={{ width: '100%' }}>
            {record.status === 0 && (
              <Tooltip title="Faturayı İptal Et">
                <Popconfirm
                  title={`"${record.invoiceNumber}" numaralı faturayı iptal etmek istediğinize emin misiniz?`}
                  description="İptal edilen faturalar artık düzenlenemez."
                  onConfirm={() => handleCancel(record.id, record.invoiceNumber)}
                  okText="Evet, İptal Et"
                  cancelText="Vazgeç"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<StopOutlined />}
                    size="small"
                    style={{ width: '100%', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 8 }}
                  >
                    İptal Et
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            {(record.status === 0 || record.status === 1) && (
              <Tooltip title="Düzenle">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(record)}
                  style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 8 }}
                />
              </Tooltip>
            )}
            {record.status === 0 && (
              <Tooltip title="Sil">
                <Popconfirm title="Bu faturayı silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
                  <Button danger icon={<DeleteOutlined />} style={{ flex: 1, border: '1px solid #fecaca', borderRadius: 8 }} />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Section - Modern Cards */}
      <Card
        className="rounded-xl shadow-sm border-0 bg-white"
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                <DollarOutlined style={{ color: '#3b82f6', marginRight: 12 }} />
                Fatura Yönetimi
              </Title>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Toplam {invoices.length} fatura kaydı
              </Text>
            </Col>
            <Col>
              <Space size={12}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showAddModal}
                  style={{
                    background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)',
                    height: 40
                  }}
                >
                  Yeni Fatura Ekle
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ padding: '20px 24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
              <Row align="middle" gutter={12}>
                <Col>
                  <DollarOutlined style={{ fontSize: 28, opacity: 0.9 }} />
                </Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{invoices.length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13 }}>Toplam Fatura</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
              <Row align="middle" gutter={12}>
                <Col><DollarOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{invoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toLocaleString()} ₺</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Tutar</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
              <Row align="middle" gutter={12}>
                <Col><ClockCircleOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{invoices.filter(i => i.status === 0).length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Bekleyen Faturalar</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <Row align="middle" gutter={12}>
                <Col><SendOutlined style={{ fontSize: 28, opacity: 0.9, color: 'white' }} /></Col>
                <Col>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{invoices.filter(i => i.status === 1).length}</div>
                  <div style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Gönderilen Faturalar</div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Main Table */}
        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={filteredInvoices}
            columns={invoiceColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
              className: 'mt-4'
            }}
            bordered={false}
            size="middle"
            style={{ borderRadius: 12, overflow: 'hidden' }}
            className="border border-slate-200 rounded-xl"
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
          />
        </div>
      </Card>

      {/* Add/Edit Invoice Modal - Modern Design */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{editingId ? 'Faturayı Düzenle' : 'Yeni Fatura Kaydı'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="invoiceNumber"
                label={<span style={{ fontWeight: 600 }}>Fatura Numarası</span>}
                rules={[{ required: true, max: 50, message: 'Fatura numarası zorunludur!' }]}
              >
                <Input
                  placeholder="Örn: FV-2024-001"
                  maxLength={50}
                  showCount
                  prefix={<DollarOutlined style={{ color: '#3b82f6' }} />}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={<span style={{ fontWeight: 600 }}>Durum</span>} rules={[{ required: true, message: 'Durum seçimi zorunludur!' }]}>
                <Select
                  placeholder="Durum Seçin"
                  size="large"
                  style={{ borderRadius: 10 }}
                  options={[
                    { value: 0, label: 'Taslak' },
                    { value: 1, label: 'Gönderildi' },
                    { value: 2, label: 'Ödenmiş' },
                    { value: 3, label: 'Vadesi Geçti' },
                    { value: 4, label: 'İptal Edildi' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="pharmacyId" label={<span style={{ fontWeight: 600 }}>Fatura Edilen</span>} rules={[{ required: true, message: 'Fatura edilen eczane zorunludur!' }]}>
                <Select
                  placeholder="Eczane Seçin"
                  size="large"
                  style={{ borderRadius: 10 }}
                  options={pharmacies.map(p => ({ value: p.id, label: p.name, extra: p.taxNumber ? `VKN: ${p.taxNumber}` : '' }))}
                  showSearch
                  optionFilterProp="children"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shipmentId" label={<span style={{ fontWeight: 600 }}>Sevkiyat</span>} rules={[{ required: true, message: 'Sevkiyat seçimi zorunludur!' }]}>
                <Select
                  placeholder="Sevkiyat Seçin"
                  size="large"
                  style={{ borderRadius: 10 }}
                  options={shipments.map(s => ({ value: s.id, label: s.trackingNumber, extra: pharmacies.find(p => p.id === s.pharmacyId)?.name || '' }))}
                  showSearch
                  optionFilterProp="children"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="issueDate" label={<span style={{ fontWeight: 600 }}>Fatura Tarihi</span>} rules={[{ required: true, message: 'Fatura tarihi zorunludur!' }]}>
                <DatePicker
                  placeholder="Fatura Tarihi"
                  style={{ width: '100%', borderRadius: 10, height: 44 }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label={<span style={{ fontWeight: 600 }}>Vade Tarihi</span>} rules={[{ required: true, message: 'Vade tarihi zorunludur!' }]}>
                <DatePicker
                  placeholder="Vade Tarihi"
                  style={{ width: '100%', borderRadius: 10, height: 44 }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col span={8}>
              <Form.Item name="subTotal" label={<span style={{ fontWeight: 600 }}>Ara Toplam</span>} rules={[{ required: true, message: 'Ara toplam zorunludur!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} step={0.01} size="large" addonAfter="₺" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="taxTotal" label={<span style={{ fontWeight: 600 }}>KDV</span>} rules={[{ required: true, message: 'KDV zorunludur!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} step={0.01} size="large" addonAfter="₊" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="grandTotal" label={<span style={{ fontWeight: 600 }}>Genel Toplam</span>} rules={[{ required: true, message: 'Genel toplam zorunludur!' }]}>
                <InputNumber style={{ width: '100%', borderRadius: 10 }} min={0} step={0.01} size="large" addonAfter="₺" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 12, borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Print/PDF Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PrinterOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Fatura PDF Görüntüleme</span>
          </div>
        }
        open={isPrintModalVisible}
        onCancel={() => setIsPrintModalVisible(false)}
        footer={[
          <Button key="print" onClick={() => setIsPrintModalVisible(false)} style={{ borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', border: 'none' }}>
            Kapat
          </Button>
        ]}
        width={800}
      >
        {selectedInvoice && (
          <div style={{ padding: '40px', background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
              <div>
                <Title level={3} style={{ color: '#3b82f6', margin: 0 }}>Fatura</Title>
                <Text style={{ fontSize: 16, marginTop: 8 }}>
                  <BarcodeOutlined style={{ marginRight: 8 }} />
                  <strong>{selectedInvoice.invoiceNumber}</strong>
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Fatura Tarihi</Text>
                <Text strong>{selectedInvoice.issueDate ? dayjs(selectedInvoice.issueDate).format('DD/MM/YYYY') : '-'}</Text>
                <br />
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Vade Tarihi</Text>
                <Text strong>{selectedInvoice.dueDate ? dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY') : '-'}</Text>
              </div>
            </div>

            <div style={{ marginBottom: 30 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Fatura Edilen</Text>
              <Text strong style={{ fontSize: 16 }}>{getPharmacyName(selectedInvoice.pharmacyId)}</Text>
            </div>

            <div style={{ marginBottom: 30, padding: 20, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text><strong>Ara Toplam:</strong> {selectedInvoice.subTotal.toLocaleString()} ₺</Text>
                <Text><strong>KDV:</strong> {selectedInvoice.taxTotal.toLocaleString()} ₺</Text>
              </div>
              <div style={{ borderTop: '2px solid #3b82f6', paddingTop: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}><strong>Genel Toplam:</strong> {selectedInvoice.grandTotal.toLocaleString()} ₺</Text>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-block', padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #22c55e' }}>
                <CheckCircleOutlined style={{ color: '#22c55e', marginRight: 8 }} />
                <Text strong style={{ color: '#16a34a' }}>{getStatusTag(selectedInvoice.status)}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}