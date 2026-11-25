import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Tag, Descriptions, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

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

  // Özet istatistikler
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const completedCount = transactions.filter(t => t.status === 1).length;
  const pendingCount = transactions.filter(t => t.status === 0).length;

  const columns = [
    {
      title: 'Fatura No',
      key: 'invoice',
      render: (_: any, r: PaymentTransaction) => {
        const inv = invoices.find(i => i.id === r.invoiceId);
        return inv ? <Text strong style={{ color: '#1890ff' }}>{inv.invoiceNumber}</Text> : <Text type="secondary">{r.invoiceId?.slice(0, 8)}...</Text>;
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
      render: (v: number) => <Text strong style={{ color: '#ff7a00' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v)}</Text>
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

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><DollarOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Ödeme İşlemleri</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}>Yeni Ödeme Kaydı</Button>}
      >
        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Ödeme</span>}
                value={transactions.length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<DollarOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Tutar</span>}
                value={totalAmount.toFixed(2)}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<DollarOutlined style={{ color: 'white' }} />}
                suffix="₺"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #52c41a, #73d13d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Tamamlanan</span>}
                value={completedCount}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #faad14, #ffc53d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Bekleyen</span>}
                value={pendingCount}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Table dataSource={transactions} columns={columns} rowKey="id" loading={loading} bordered={false} size="middle" className="border border-slate-200 rounded-xl" />
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
                  {inv.invoiceNumber} - {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(inv.grandTotal)}
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

          <Form.Item name="amount" label="Ödeme Tutarı" rules={[{ required: true, message: 'Tutar giriniz' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="₺" />
          </Form.Item>

          <Form.Item name="transactionReference" label="İşlem Referans No">
            <Input placeholder="Banka/kart referans numarası" />
          </Form.Item>

          <Form.Item name="status" label="Durum" initialValue={0}>
            <Select>
              <Select.Option value={0}>Beklemede</Select.Option>
              <Select.Option value={1}>Tamamlandı</Select.Option>
              <Select.Option value={2}>Başarısız</Select.Option>
              <Select.Option value={3}>İade Edildi</Select.Option>
              <Select.Option value={4}>İptal Edildi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={2} placeholder="Opsiyonel not..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8, borderRadius: 10 }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10 }}>Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
