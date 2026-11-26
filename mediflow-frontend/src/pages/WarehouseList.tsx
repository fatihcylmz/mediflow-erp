import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Switch, Space, Popconfirm, Tag, Row, Col, Divider } from 'antd';
import { DatabaseOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, EnvironmentOutlined, UserOutlined, FireOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface Warehouse {
  id: string;
  name: string;
  locationAddress: string;
  managerName: string;
  hasColdStorage: boolean;
}

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/app/warehouse');
      setWarehouses(response.data.items || []);
    } catch (error) {
      message.error('Depolar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ hasColdStorage: false });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Warehouse) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await api.put(`/api/app/warehouse/${editingId}`, values);
        message.success('Depo güncellendi.');
      } else {
        await api.post('/api/app/warehouse', values);
        message.success('Yeni depo eklendi.');
      }
      setIsModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      message.error('Depo kaydedilemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/app/warehouse/${id}`);
      message.success('Depo silindi.');
      fetchWarehouses();
    } catch (error) {
      message.error('Depo silinemedi (İçinde stok bulunuyor olabilir).');
    }
  };

  const columns = [
    { title: 'Depo Adı', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Yönetici', dataIndex: 'managerName', key: 'managerName', render: (v: string) => v ? <span><UserOutlined style={{ marginRight: 6, color: '#64748b' }} />{v}</span> : '-' },
    { title: 'Adres', dataIndex: 'locationAddress', key: 'locationAddress', render: (v: string) => v ? <span><EnvironmentOutlined style={{ marginRight: 6, color: '#ff7a00' }} />{v}</span> : '-' },
    {
      title: 'Soğuk Zincir',
      dataIndex: 'hasColdStorage',
      key: 'hasColdStorage',
      render: (has: boolean) => has
        ? <Tag color="blue" style={{ borderRadius: 20, padding: '2px 10px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><FireOutlined /> Aktif</Tag>
        : <Tag color="default" style={{ borderRadius: 20, padding: '2px 10px' }}>Yok</Tag>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Warehouse) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showEditModal(record)} size="small" style={{ borderRadius: 8 }} />
          <Popconfirm title="Depoyu sil?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 8 }} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const coldCount = warehouses.filter(w => w.hasColdStorage).length;

  return (
    <div className="space-y-4" style={{ padding: 0 }}>
      {/* Header Section */}
      <Card
        className="rounded-xl shadow-sm border-0 bg-white"
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <Row align="middle" gutter={16}>
            <Col>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApartmentOutlined style={{ fontSize: 22, color: 'white' }} />
              </div>
            </Col>
            <Col flex="auto">
              <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Depolar</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Tüm depoları ve soğuk zincir bilgilerini yönetin</Text>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderColor: 'transparent',
                borderRadius: 10, height: 42, fontWeight: 600, boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}>
                Yeni Depo Ekle
              </Button>
            </Col>
          </Row>
        </div>

        {/* KPI Cards - Modern White Surface */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={8}>
            <KPICard title="Toplam Depo" value={warehouses.length} subtitle="depovariante" color="#1D4ED8" icon={<DatabaseOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <KPICard title="Soğuk Zincir Aktif" value={coldCount} subtitle="soğuk zincir depolara sahip" color="#0EA5E9" icon={<FireOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <KPICard title="Soğuk Zincir Yok" value={warehouses.length - coldCount} subtitle="standart depo" color="#10B981" icon={<BulbOutlined />} />
          </Col>
        </Row>

        <div style={{ padding: '0 24px 24px' }}>
          <Table
            dataSource={warehouses}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="middle"
            style={{ borderRadius: 12, overflow: 'hidden' }}
            className="border border-slate-200 rounded-xl"
            rowClassName={(record, index) => index % 2 === 0 ? 'bg-slate-50' : ''}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Toplam ${t} kayıt` }}
          />
        </div>
      </Card>

      {/* Add/Edit Modal - Modern Design */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ApartmentOutlined style={{ fontSize: 16, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 700 }}>{editingId ? 'Depoyu Düzenle' : 'Yeni Depo Ekle'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Depo Adı" rules={[{ required: true, max: 128, message: 'Depo adı zorunludur' }]}>
            <Input maxLength={128} showCount prefix={<DatabaseOutlined style={{ color: '#3b82f6' }} />} placeholder="Depo adını girin" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="managerName" label="Depo Yöneticisi">
            <Input prefix={<UserOutlined style={{ color: '#64748b' }} />} placeholder="Yönetici adı soyadı" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="locationAddress" label="Adres">
            <Input.TextArea rows={2} placeholder="Depo adresini girin" style={{ borderRadius: 10 }} />
          </Form.Item>

          <Form.Item name="hasColdStorage" label="Soğuk Zincir Var mı?" valuePropName="checked">
            <Switch checkedChildren={<FireOutlined />} unCheckedChildren="Kapalı" />
          </Form.Item>

          <Divider style={{ margin: '16px 0 20px' }} />

          <div style={{ textAlign: 'right', marginTop: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8, borderRadius: 8, height: 40, padding: '0 16px' }}>
              İptal
            </Button>
            <Button type="primary" htmlType="submit" style={{
              borderRadius: 8, height: 40, padding: '0 24px',
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderColor: 'transparent', fontWeight: 600
            }}>
              Kaydet
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
