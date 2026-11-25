import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Popconfirm, Tag, DatePicker, Row, Col, Drawer, Statistic, Empty, Tooltip } from 'antd';
import { InboxOutlined, PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

// - Inventories Domain
interface StockBatch {
  id: string;
  drugId: string;
  warehouseId: string;
  supplierId?: string; // Tedarikçi desteği eklendi
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  reservedQuantity: number;
  shelfLocation: string;
  isQuarantined: boolean;
}

interface StockMovementLog {
  id: string;
  stockBatchId: string;
  movementType: number; 
  quantityChange: number;
  referenceId: string | null;
  description: string;
  creationTime: string; 
}

interface Drug { id: string; name: string; }
interface Warehouse { id: string; name: string; }
interface Supplier { id: string; name: string; }

// İlaç bazlı gruplanmış özet arayüzü
interface DrugSummary {
  drugId: string;
  drugName: string;
  totalQuantity: number;
  totalAvailable: number;
  batches: StockBatch[];
}

export default function InventoryList() {
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Depo Filtresi (Tümü veya seçilen depo ID)
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string | null>(null);

  // Lot CRUD Form State'leri
  const [isFormModalVisible, setIsFormModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detay Modal / Drawer (İlaç bazlı lotları görmek için)
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [selectedDrugSummary, setSelectedDrugSummary] = useState<DrugSummary | null>(null);

  // Hareket Logları Drawer State'leri
  const [isLogDrawerVisible, setIsLogDrawerVisible] = useState<boolean>(false);
  const [movements, setMovements] = useState<StockMovementLog[]>([]);
  const [loadingMovements, setLoadingMovements] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [stockRes, drugRes, warehouseRes, supRes] = await Promise.all([
        api.get('/api/app/stock-batch'),
        api.get('/api/app/drug'),
        api.get('/api/app/warehouse'),
        api.get('/api/app/supplier')
      ]);
      setStockBatches(stockRes.data.items || []);
      setDrugs(drugRes.data.items || []);
      setWarehouses(warehouseRes.data.items || []);
      setSuppliers(supRes.data.items || []);
    } catch (error) {
      message.error('Envanter verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ quantity: 1, reservedQuantity: 0, isQuarantined: false });
    setIsFormModalVisible(true);
  };

  const showEditModal = (record: StockBatch) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      expirationDate: record.expirationDate ? dayjs(record.expirationDate) : null
    });
    setIsFormModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        expirationDate: values.expirationDate ? values.expirationDate.toISOString() : null,
      };

      if (editingId) {
        await api.put(`/stock-batch/${editingId}`, payload);
        message.success('Lot bilgisi güncellendi.');
      } else {
        await api.post('/api/app/stock-batch', payload);
        message.success('Mal kabul başarılı (Yeni Lot ve Tedarikçi bağlandı).');
      }
      setIsFormModalVisible(false);
      fetchInitialData();
    } catch (error) {
      message.error('Kaydetme hatası.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/stock-batch/${id}`);
      message.success('Lot silindi.');
      fetchInitialData();
    } catch (error) {
      message.error('Silme başarısız (Siparişte kullanılmış olabilir).');
    }
  };

  const showMovements = async (batchId: string) => {
    setIsLogDrawerVisible(true);
    setLoadingMovements(true);
    try {
      const response = await api.get('/api/app/stock-movement-log');
      const allLogs = response.data.items || [];
      const filtered = allLogs.filter((log: StockMovementLog) => log.stockBatchId === batchId);
      setMovements(filtered);
    } catch (error) {
      message.error('Hareket logları yüklenemedi.');
    } finally {
      setLoadingMovements(false);
    }
  };

  const getMovementTag = (type: number) => {
    switch(type) {
      case 0: return <Tag color="green">Giriş (+)</Tag>;
      case 1: return <Tag color="blue">Çıkış (-)</Tag>;
      case 2: return <Tag color="purple">İade (+)</Tag>;
      case 3: return <Tag color="red">Fire (-)</Tag>;
      case 4: return <Tag color="orange">Düzeltme</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  // --- İLAÇ BAZLI ÖZET HESAPLAMA (Seçilen depoya göre filtreleyerek) ---
  const getGroupedDrugSummaries = (): DrugSummary[] => {
    const filteredBatches = selectedWarehouseFilter 
      ? stockBatches.filter(b => b.warehouseId === selectedWarehouseFilter)
      : stockBatches;

    const summaryMap: { [drugId: string]: StockBatch[] } = {};

    filteredBatches.forEach(batch => {
      if (!summaryMap[batch.drugId]) {
        summaryMap[batch.drugId] = [];
      }
      summaryMap[batch.drugId].push(batch);
    });

    return Object.keys(summaryMap).map(drugId => {
      const batches = summaryMap[drugId];
      const drug = drugs.find(d => d.id === drugId);
      const totalQuantity = batches.reduce((acc, curr) => acc + curr.quantity, 0);
      const totalAvailable = batches.reduce((acc, curr) => acc + (curr.quantity - (curr.reservedQuantity || 0)), 0);

      return {
        drugId,
        drugName: drug ? drug.name : 'Bilinmeyen İlaç',
        totalQuantity,
        totalAvailable,
        batches
      };
    });
  };

  const summaryData = getGroupedDrugSummaries();

  const summaryColumns = [
    { 
      title: 'İlaç Adı', 
      dataIndex: 'drugName', 
      key: 'drugName', 
      render: (text: string) => <Text strong style={{ fontSize: '15px' }}>{text}</Text> 
    },
    { 
      title: 'Toplam Fiziki Stok', 
      key: 'totalQuantity', 
      render: (_: any, record: DrugSummary) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{record.totalQuantity} Kutu</Tag>
    },
    { 
      title: 'Toplam Serbest Stok', 
      key: 'totalAvailable', 
      render: (_: any, record: DrugSummary) => <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>{record.totalAvailable} Kutu</Tag>
    },
    {
      title: 'Lot / Detay İşlemleri',
      key: 'action',
      render: (_: any, record: DrugSummary) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedDrugSummary(record);
            setIsDetailDrawerVisible(true);
          }}
        >
          Lot ve SKT Detayları ({record.batches.length} Lot)
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><InboxOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Depo ve Stok Yönetimi</Title>}
        extra={
          <Space>
            {/* DEPO SEÇİM / FİLTRE DROPDOWN */}
            <Select
              allowClear
              placeholder="Tüm Depolar (Genel Görünüm)"
              style={{ width: 260 }}
              value={selectedWarehouseFilter}
              onChange={(val) => setSelectedWarehouseFilter(val)}
              showSearch
              optionFilterProp="children"
            >
              {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
            </Select>

            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}>
              Mal Kabul (Yeni Lot)
            </Button>
          </Space>
        }
      >
        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Lot</span>}
                value={stockBatches.length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<InboxOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Fiziki Stok</span>}
                value={stockBatches.reduce((sum, b) => sum + b.quantity, 0)}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<InboxOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Serbest Stok</span>}
                value={stockBatches.reduce((sum, b) => sum + (b.quantity - (b.reservedQuantity || 0)), 0)}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<InboxOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Karantinada</span>}
                value={stockBatches.filter(b => b.isQuarantined).length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<InboxOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Table
          dataSource={summaryData}
          columns={summaryColumns}
          rowKey="drugId"
          loading={loading}
          bordered={false}
          size="middle"
          className="border border-slate-200 rounded-xl"
          locale={{ emptyText: <Empty description="Henüz stok kaydı yok" /> }}
        />
      </Card>

      {/* MAL KABUL MODALI */}
      <Modal title={editingId ? "Lot Düzenle" : "Mal Kabul (Depo Girişi)"} open={isFormModalVisible} onCancel={() => setIsFormModalVisible(false)} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="drugId" label="Gelen İlaç" rules={[{ required: true }]}>
                <Select placeholder="İlaç Seçin" showSearch optionFilterProp="children">
                  {drugs.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="warehouseId" label="Hangi Depoya İnecek?" rules={[{ required: true }]}>
                <Select placeholder="Depo Seçin" showSearch optionFilterProp="children">
                  {warehouses.map(w => <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {/* TEDARİKÇİ SEÇİMİ MAL KABULA EKLENDİ */}
              <Form.Item name="supplierId" label="Tedarikçi Firma" rules={[{ required: true, message: 'Tedarikçi seçilmelidir' }]}>
                <Select placeholder="Tedarikçi Seçin" showSearch optionFilterProp="children">
                  {suppliers.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lotNumber" label="Lot Numarası" rules={[{ required: true, max: 50 }]}>
                <Input placeholder="Örn: LOT-2026-01" maxLength={50} showCount />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expirationDate" label="SKT (Son Kullanma Tarihi)" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantity" label="Miktar (Kutu)" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="shelfLocation" label="Raf Konumu">
                <Input placeholder="Raf A-3" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="reservedQuantity" hidden><InputNumber /></Form.Item>
          <Form.Item name="isQuarantined" label="Karantinaya Al?" valuePropName="checked"><Switch /></Form.Item>

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button onClick={() => setIsFormModalVisible(false)} style={{ marginRight: 8, borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* İLAÇ DETAY / LOT & TEDARİKÇİ KIRILIM DRAWERI */}
      <Drawer
        title={selectedDrugSummary ? `${selectedDrugSummary.drugName} - Lot, SKT ve Tedarikçi Detayları` : 'Detaylar'}
        placement="right"
        width={850}
        onClose={() => setIsDetailDrawerVisible(false)}
        open={isDetailDrawerVisible}
      >
        <Table 
          dataSource={selectedDrugSummary?.batches || []} 
          rowKey="id" 
          pagination={false}
          bordered
          columns={[
            { title: 'Lot No', dataIndex: 'lotNumber', key: 'lotNumber', render: (t) => <Text strong>{t}</Text> },
            { 
              title: 'Tedarikçi Firma', 
              key: 'supplier',
              render: (_, record) => {
                const sup = suppliers.find(s => s.id === record.supplierId);
                return sup ? <Tag color="purple">{sup.name}</Tag> : <Text type="secondary">Belirtilmemiş</Text>;
              }
            },
            { 
              title: 'Bulunduğu Depo', 
              key: 'warehouse',
              render: (_, record) => {
                const wh = warehouses.find(w => w.id === record.warehouseId);
                return wh ? wh.name : '-';
              }
            },
            { 
              title: 'SKT', 
              dataIndex: 'expirationDate', 
              key: 'expirationDate',
              render: (date) => {
                const isExpired = new Date(date) < new Date();
                return <Text type={isExpired ? "danger" : undefined}>{new Date(date).toLocaleDateString('tr-TR')}</Text>;
              }
            },
            { 
              title: 'Miktar', 
              key: 'qty',
              render: (_, record) => <Text strong>{record.quantity} Kutu</Text>
            },
            {
              title: 'İşlemler',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button size="small" type="dashed" icon={<HistoryOutlined />} onClick={() => showMovements(record.id)}>Log</Button>
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={() => { setIsDetailDrawerVisible(false); showEditModal(record); }} />
                  <Popconfirm title="Lotu sil?" onConfirm={async () => { await handleDelete(record.id); setIsDetailDrawerVisible(false); }}>
                    <Button danger size="small" type="text" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Drawer>

      {/* HAREKET LOGLARI DRAWERI */}
      <Drawer
        title="Lot Hareket Geçmişi (Giriş/Çıkış Logları)"
        placement="right"
        width={600}
        onClose={() => setIsLogDrawerVisible(false)}
        open={isLogDrawerVisible}
      >
        <Table dataSource={movements} columns={[
          { title: 'Tarih', dataIndex: 'creationTime', key: 'creationTime', render: (d) => d ? new Date(d).toLocaleString('tr-TR') : '-' },
          { title: 'Tip', dataIndex: 'movementType', key: 'movementType', render: (type: number) => getMovementTag(type) },
          { title: 'Değişim', dataIndex: 'quantityChange', key: 'quantityChange', render: (q) => <Text strong>{q > 0 ? `+${q}` : q}</Text> },
          { title: 'Açıklama', dataIndex: 'description', key: 'description' }
        ]} rowKey="id" size="small" loading={loadingMovements} pagination={false} bordered />
      </Drawer>
    </div>
  );
}