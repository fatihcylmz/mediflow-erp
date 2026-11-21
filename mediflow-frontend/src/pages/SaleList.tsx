import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Select, DatePicker, Space, Popconfirm, InputNumber, Row, Col, Statistic } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

//[cite: 27]
interface Sale {
  id: string;
  pharmacyId: string;
  customerId: string;
  prescriptionId: string | null;
  saleDate: string;
  totalAmount: number;
}

//[cite: 28]
interface SaleItem {
  id: string;
  saleId: string;
  stockBatchId: string;
  quantity: number;
  unitPrice: number;
}

interface Pharmacy { id: string; name: string; }
interface Customer { id: string; firstName: string; lastName: string; identityNumber: string; }
interface Prescription { id: string; ePrescriptionNumber: string; }
interface StockBatch { id: string; lotNumber: string; drugId: string; }
interface Drug { id: string; name: string; }

export default function SaleList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ana Satış Modal State'leri
  const [isSaleModalVisible, setIsSaleModalVisible] = useState<boolean>(false);
  const [saleForm] = Form.useForm();
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  // Satış Kalemleri Modal State'leri
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [saleRes, pharmRes, custRes, presRes, batchRes, drugRes] = await Promise.all([
        api.get('/sale'),
        api.get('/pharmacy'),
        api.get('/customer'),
        api.get('/prescription'),
        api.get('/stock-batch'), // İzlenebilirlik için Lot eşleştirmesi
        api.get('/drug') // Lotların içindeki ilaç isimleri
      ]);
      setSales(saleRes.data.items || []);
      setPharmacies(pharmRes.data.items || []);
      setCustomers(custRes.data.items || []);
      setPrescriptions(presRes.data.items || []);
      setStockBatches(batchRes.data.items || []);
      setDrugs(drugRes.data.items || []);
    } catch (error) {
      console.error('API Hatası:', error);
      message.error('Satış verileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ANA SATIŞ (SALE) İŞLEMLERİ
  // ==========================================

  const showAddSaleModal = () => {
    setEditingSaleId(null);
    saleForm.resetFields();
    saleForm.setFieldsValue({ saleDate: dayjs(), totalAmount: 0 });
    setIsSaleModalVisible(true);
  };

  const showEditSaleModal = (record: Sale) => {
    setEditingSaleId(record.id);
    saleForm.setFieldsValue({
      ...record,
      saleDate: record.saleDate ? dayjs(record.saleDate) : null,
      prescriptionId: record.prescriptionId || undefined // null ise Select'te placeholder görünsün
    });
    setIsSaleModalVisible(true);
  };

  const handleSaleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        saleDate: values.saleDate ? values.saleDate.toISOString() : null,
        prescriptionId: values.prescriptionId || null // Reçetesiz satışlarda null gidecek[cite: 27]
      };

      if (editingSaleId) {
        await api.put(`/sale/${editingSaleId}`, payload);
        message.success('Satış kaydı güncellendi.');
      } else {
        await api.post('/sale', payload);
        message.success('Yeni satış kaydı oluşturuldu.');
      }
      setIsSaleModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Satış kaydedilemedi.');
    }
  };

  const handleSaleDelete = async (id: string) => {
    try {
      await api.delete(`/sale/${id}`);
      message.success('Satış kaydı silindi.');
      fetchData();
    } catch (error) {
      message.error('Silme başarısız (Bağlı kalemler olabilir).');
    }
  };

  // ==========================================
  // SATIŞ KALEMLERİ (SALE ITEM) İŞLEMLERİ
  // ==========================================

  const showSaleDetails = async (saleData: Sale) => {
    setSelectedSale(saleData);
    setIsDetailModalVisible(true);
    setLoadingItems(true);
    itemForm.resetFields();

    try {
      const response = await api.get('/sale-item');
      const allItems = response.data.items || [];
      const filteredItems = allItems.filter((item: SaleItem) => item.saleId === saleData.id); //[cite: 28]
      setSaleItems(filteredItems);
    } catch (error) {
      message.error('Satış kalemleri yüklenemedi.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddItem = async (values: any) => {
    if (!selectedSale) return;
    try {
      const payload = {
        saleId: selectedSale.id,
        stockBatchId: values.stockBatchId,
        quantity: values.quantity,
        unitPrice: values.unitPrice
      };
      await api.post('/sale-item', payload);
      message.success('Satış kalemi eklendi.');
      showSaleDetails(selectedSale); // Listeyi yenile
    } catch (error) {
      message.error('Kalem eklenemedi.');
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await api.delete(`/sale-item/${id}`);
      message.success('Kalem silindi.');
      if (selectedSale) showSaleDetails(selectedSale);
    } catch (error) {
      message.error('Silme başarısız.');
    }
  };

  // --- SÜTUNLAR VE TABLOLAR ---

  const saleColumns = [
    {
      title: 'Eczane',
      key: 'pharmacy',
      render: (_: any, record: Sale) => {
        const pharm = pharmacies.find(p => p.id === record.pharmacyId); //[cite: 27]
        return pharm ? pharm.name : 'Bilinmiyor';
      }
    },
    {
      title: 'Hasta / Müşteri',
      key: 'customer',
      render: (_: any, record: Sale) => {
        const customer = customers.find(c => c.id === record.customerId); //[cite: 27]
        return customer ? `${customer.firstName} ${customer.lastName}` : 'Bilinmiyor';
      }
    },
    {
      title: 'Reçete No',
      key: 'prescription',
      render: (_: any, record: Sale) => {
        if (!record.prescriptionId) return <Text type="secondary">Reçetesiz Satış</Text>; //[cite: 27]
        const pres = prescriptions.find(p => p.id === record.prescriptionId);
        return pres ? pres.ePrescriptionNumber : 'Bulunamadı';
      }
    },
    { 
      title: 'Satış Tarihi', 
      dataIndex: 'saleDate', 
      key: 'saleDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-' //[cite: 27]
    },
    { 
      title: 'Toplam Tutar', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      render: (amount: number) => <Text strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)}</Text> //[cite: 27]
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Sale) => (
        <Space>
          <Button type="primary" icon={<UnorderedListOutlined />} onClick={() => showSaleDetails(record)}>İçerik</Button>
          <Button ghost type="primary" icon={<EditOutlined />} onClick={() => showEditSaleModal(record)} />
          <Popconfirm title="Satış kaydını silmek istediğinize emin misiniz?" onConfirm={() => handleSaleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const itemColumns = [
    {
      title: 'Satılan Ürün (Lot İzlenebilirliği)',
      key: 'stockBatch',
      render: (_: any, record: SaleItem) => {
        const batch = stockBatches.find(b => b.id === record.stockBatchId); //[cite: 28]
        if (!batch) return 'Bilinmeyen Lot';
        const drug = drugs.find(d => d.id === batch.drugId);
        return <Text strong>{batch.lotNumber} ({drug ? drug.name : 'Bilinmeyen İlaç'})</Text>;
      }
    },
    { 
      title: 'Miktar', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (qty: number) => <Text strong>{qty} Kutu</Text> //[cite: 28]
    },
    { 
      title: 'Birim Fiyat', 
      dataIndex: 'unitPrice', 
      key: 'unitPrice',
      render: (price: number) => <Text>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)}</Text> //[cite: 28]
    },
    { 
      title: 'Ara Toplam', 
      key: 'subTotal',
      render: (_: any, record: SaleItem) => <Text strong>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(record.quantity * record.unitPrice)}</Text>
    },
    {
      title: 'Çıkar',
      key: 'action',
      render: (_: any, record: SaleItem) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.id)} />
      )
    }
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><ShoppingCartOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Satış ve Reçete İşlemleri</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddSaleModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}>Yeni Satış Kaydı</Button>}
      >
        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Satış</span>}
                value={sales.length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Toplam Gelir</span>}
                value={sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Reçeteli Satış</span>}
                value={sales.filter(s => s.prescriptionId).length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" className="border-0 shadow-sm rounded-lg" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}>
              <Statistic
                title={<span style={{ opacity: 0.9, fontSize: 13, color: 'white' }}>Reçetesiz Satış</span>}
                value={sales.filter(s => !s.prescriptionId).length}
                valueStyle={{ color: '#fff', fontWeight: 700 }}
                prefix={<ShoppingCartOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Table dataSource={sales} columns={saleColumns} rowKey="id" loading={loading} bordered={false} size="middle" className="border border-slate-200 rounded-xl" />
      </Card>

      {/* ANA SATIŞ CRUD MODALI */}
      <Modal
        title={editingSaleId ? "Satışı Düzenle" : "Yeni Satış Oluştur"}
        open={isSaleModalVisible}
        onCancel={() => setIsSaleModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={saleForm} layout="vertical" onFinish={handleSaleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pharmacyId" label="Satışı Yapan Eczane" rules={[{ required: true }]}>
                <Select placeholder="Eczane Seçin" showSearch optionFilterProp="children">
                  {pharmacies.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerId" label="Hasta / Müşteri" rules={[{ required: true }]}>
                <Select placeholder="Hasta Seçin" showSearch optionFilterProp="children">
                  {customers.map(c => <Select.Option key={c.id} value={c.id}>{c.identityNumber} - {c.firstName} {c.lastName}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              {/* Reçete İsteğe Bağlı */}
              <Form.Item name="prescriptionId" label="Reçete (İsteğe Bağlı - OTC İçin Boş Bırakın)">
                <Select placeholder="Reçete Seçin (Varsa)" allowClear showSearch optionFilterProp="children">
                  {prescriptions.map(p => <Select.Option key={p.id} value={p.id}>{p.ePrescriptionNumber}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="saleDate" label="Satış Tarihi" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
             {/* DbContext kısıtlaması: decimal(18,2) -> step 0.01 */}
             <Form.Item name="totalAmount" label="Toplam Tutar" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
               <InputNumber style={{ width: '100%', fontWeight: 'bold' }} min={0} step={0.01} addonAfter="₺" />
             </Form.Item>
          </div>

          <Form.Item style={{ textAlign: 'right', margin: 0 }}>
            <Button onClick={() => setIsSaleModalVisible(false)} style={{ marginRight: '8px', borderRadius: 10, height: 44, border: '1px solid #e2e8f0' }}>İptal</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderRadius: 10, height: 44, border: 'none', boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* SATIŞ İÇERİĞİ (KALEMLER) MODALI */}
      <Modal
        title={selectedSale ? `Satış Kalemleri - Fiş No: ${selectedSale.id.substring(0, 8)}` : 'Satış İçeriği'}
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={900}
        footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Kapat</Button>]}
      >
        {/* Yeni Kalem Ekleme Formu */}
        <Card size="small" style={{ marginBottom: '16px', background: '#fafafa' }}>
          <Form form={itemForm} layout="inline" onFinish={handleAddItem}>
            <Form.Item name="stockBatchId" rules={[{ required: true, message: 'Lot Seçin' }]}>
              <Select placeholder="Satılan Lot (İlaç) Seç" style={{ width: 300 }} showSearch optionFilterProp="children">
                {stockBatches.map(b => {
                   const d = drugs.find(drug => drug.id === b.drugId);
                   return <Select.Option key={b.id} value={b.id}>{b.lotNumber} ({d ? d.name : ''})</Select.Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item name="quantity" rules={[{ required: true, message: 'Miktar' }]}>
              <InputNumber placeholder="Adet" min={1} style={{ width: 100 }} />
            </Form.Item>
            {/* DbContext kısıtlaması: decimal(18,2) -> step 0.01 */}
            <Form.Item name="unitPrice" rules={[{ required: true, message: 'Birim Fiyat' }]}>
              <InputNumber placeholder="Birim Fiyat" min={0} step={0.01} style={{ width: 150 }} addonAfter="₺" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Ekle</Button>
            </Form.Item>
          </Form>
        </Card>
        
        <Table 
          dataSource={saleItems} 
          columns={itemColumns} 
          rowKey="id" 
          pagination={false} 
          size="small" 
          loading={loadingItems}
          bordered
        />
      </Modal>
    </div>
  );
}