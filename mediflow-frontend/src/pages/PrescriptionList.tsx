import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, Tag, Row, Col, Avatar, Tooltip, Divider, Empty } from 'antd';
import {
  FileProtectOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, TeamOutlined, MedicineBoxOutlined, CalendarOutlined,
  ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface Prescription {
  id: string;
  customerId: string;
  ePrescriptionNumber: string;
  doctorName: string;
  doctorDiplomaNumber: string;
  hospitalName: string;
  issueDate: string;
}

interface Customer {
  id: string;
  identityNumber: string;
  firstName: string;
  lastName: string;
}

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const role = localStorage.getItem('role') || '';
  const isOwnPharmacyScope = role === 'pharmacy' || role === 'sales';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [presRes, custRes] = await Promise.all([
        api.get('/api/app/prescription'),
        api.get('/api/app/customer')
      ]);
      setPrescriptions(presRes.data.items || []);
      setCustomers(custRes.data.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Reçete verileri yüklenemedi.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ issueDate: dayjs() });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Prescription) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.toISOString() : null,
      };

      if (editingId) {
        await api.put(`/api/app/prescription/${editingId}`, payload);
        message.success('Reçete güncellendi.');
      } else {
        await api.post('/api/app/prescription', payload);
        message.success('Yeni reçete sisteme işlendi.');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Reçete kaydedilemedi.';
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/app/prescription/${id}`);
      message.success('Reçete silindi.');
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Silme işlemi başarısız (bir satışa bağlı olabilir).';
      message.error(errorMsg);
    }
  };

  const getCustomer = (customerId: string) => customers.find(c => c.id === customerId);

  const filteredPrescriptions = prescriptions.filter(p => {
    if (!searchText) return true;
    const c = getCustomer(p.customerId);
    const haystack = [
      p.ePrescriptionNumber,
      p.doctorName,
      p.hospitalName,
      c ? `${c.firstName} ${c.lastName} ${c.identityNumber}` : ''
    ].join(' ').toLowerCase();
    return haystack.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'Reçete Bilgisi',
      key: 'info',
      render: (_: any, record: Prescription) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            icon={<FileProtectOutlined />}
            style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', fontSize: 18 }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 14 }}>{record.ePrescriptionNumber}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.doctorName || 'Doktor belirtilmemiş'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Hasta',
      key: 'customer',
      render: (_: any, record: Prescription) => {
        const customer = getCustomer(record.customerId);
        if (!customer) return <Text type="secondary">Bilinmeyen Hasta</Text>;
        return (
          <div>
            <Text style={{ display: 'block', fontSize: 13 }}>
              <UserOutlined style={{ color: '#94a3b8', marginRight: 6 }} />
              {customer.firstName} {customer.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              {customer.identityNumber}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Hastane / Kurum',
      dataIndex: 'hospitalName',
      key: 'hospitalName',
      width: 220,
      render: (v: string) => v ? <Text style={{ fontSize: 13 }}>{v}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Yazım Tarihi',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 150,
      render: (date: string) => date ? (
        <Tag color="blue" icon={<CalendarOutlined />} style={{ borderRadius: 6 }}>
          {dayjs(date).format('DD.MM.YYYY')}
        </Tag>
      ) : <Text type="secondary">-</Text>
    },
    {
      title: 'Hızlı İşlemler',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Prescription) => (
        <Space size={4}>
          <Tooltip title="Düzenle">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Reçeteyi silmek istediğinize emin misiniz?"
              okText="Evet, Sil"
              cancelText="İptal"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} style={{ border: '1px solid #fecaca', borderRadius: 6 }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    }
  ];

  const thisMonthCount = prescriptions.filter(p =>
    p.issueDate && dayjs(p.issueDate).isSame(dayjs(), 'month')
  ).length;

  const uniqueDoctors = new Set(prescriptions.map(p => p.doctorName).filter(Boolean)).size;
  const uniqueHospitals = new Set(prescriptions.map(p => p.hospitalName).filter(Boolean)).size;

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <Card className="rounded-xl shadow-sm border-0 bg-white" bodyStyle={{ padding: 0 }}>
        <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
                <FileProtectOutlined style={{ color: '#ff7a00', marginRight: 12 }} />
                Reçete Yönetimi
              </Title>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Toplam {prescriptions.length} reçete kaydı
              </Text>
              {isOwnPharmacyScope && (
                <div style={{ marginTop: 4, marginLeft: 8 }}>
                  <Tag color="orange" style={{ borderRadius: 6 }}>
                    Sadece kendi eczanenizin reçetelerini görüntülüyorsunuz
                  </Tag>
                </div>
              )}
            </Col>
            <Col>
              <Space size={12}>
                <Input
                  placeholder="Reçete, doktor, hasta ara..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  allowClear
                  style={{ width: 280, borderRadius: 10 }}
                />
                <Tooltip title="Yenile">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={loading}
                    style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showAddModal}
                  style={{
                    background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)',
                    borderColor: 'transparent',
                    borderRadius: 10,
                    boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)'
                  }}
                >
                  Yeni Reçete
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* KPI Cards - Modern White Surface */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Toplam Reçete" value={prescriptions.length} subtitle="reçete kaydı" color="#FF7A00" icon={<FileProtectOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Bu Ay Yazılan" value={thisMonthCount} subtitle="aylık reçete" color="#1D4ED8" icon={<CalendarOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Kayıtlı Doktor" value={uniqueDoctors} subtitle="doktor" color="#059669" icon={<MedicineBoxOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Kurum Sayısı" value={uniqueHospitals} subtitle="hastane/kurum" color="#7C3AED" icon={<TeamOutlined />} />
          </Col>
        </Row>

        {/* Main Table */}
        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={filteredPrescriptions}
            columns={columns}
            rowKey="id"
            loading={loading}
            scroll={{ x: 900 }}
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
            rowClassName={(_, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
            locale={{ emptyText: <Empty description="Henüz reçete kaydı yok" /> }}
          />
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileProtectOutlined style={{ color: 'white', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{editingId ? 'Reçeteyi Düzenle' : 'Yeni E-Reçete Girişi'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={720}
        styles={{ body: { paddingTop: 24 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="customerId"
            label={<span style={{ fontWeight: 600 }}>Hasta Seçimi</span>}
            rules={[{ required: true, message: 'Lütfen hastayı seçin' }]}
          >
            <Select placeholder="TCKN veya ad soyad ile arayın" showSearch optionFilterProp="label" size="large" style={{ borderRadius: 10 }}>
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id} label={`${c.identityNumber} ${c.firstName} ${c.lastName}`}>
                  <span style={{ fontFamily: 'monospace', color: '#ff7a00', fontWeight: 600 }}>{c.identityNumber}</span>
                  <span style={{ marginLeft: 8 }}>{c.firstName} {c.lastName}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="ePrescriptionNumber"
            label={<span style={{ fontWeight: 600 }}>E-Reçete Numarası</span>}
            rules={[{ required: true, max: 50, message: 'Reçete numarası zorunludur' }]}
          >
            <Input placeholder="Örn: RX-99887766" maxLength={50} showCount size="large" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Divider style={{ margin: '20px 0' }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="doctorName" label={<span style={{ fontWeight: 600 }}>Doktor Adı Soyadı</span>}>
                <Input placeholder="Örn: Dr. Ali Veli" size="large" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="doctorDiplomaNumber" label={<span style={{ fontWeight: 600 }}>Diploma / Tescil No</span>}>
                <Input placeholder="Kontrole tabi ilaçlar için" size="large" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hospitalName" label={<span style={{ fontWeight: 600 }}>Hastane / Kurum</span>}>
                <Input placeholder="Örn: Cerrahpaşa Tıp Fakültesi" size="large" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="issueDate" label={<span style={{ fontWeight: 600 }}>Yazım Tarihi</span>} rules={[{ required: true, message: 'Tarih zorunludur' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%', borderRadius: 10, height: 42 }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 12, borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}
            >
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}