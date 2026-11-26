import { useEffect, useState } from 'react';
import { Table, Typography, message, Card, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, Popconfirm, InputNumber, Row, Col, Badge } from 'antd';
import {
  RollbackOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, SyncOutlined, CheckOutlined, CloseCircleOutlined,
  AlertOutlined, FileTextOutlined, SolutionOutlined, ShoppingCartOutlined, DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { KPICard } from '../components/charts/DashboardCharts';

const { Title, Text } = Typography;

interface ReturnData {
  id: string;
  pharmacyId: string;
  invoiceId?: string;
  trackingNumber: string;
  returnDate: string;
  status?: number; 
  isApproved?: boolean;
}

interface ReturnItem {
  id: string;
  returnId: string;
  stockBatchId?: string;
  drugId?: string;
  quantity: number;
  unitPrice?: number;
  taxRate?: number;
  lineTotal?: number;
  reason: number; 
}

interface InvoiceItem {
  id: string;
  drugId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

interface Invoice {
  id: string;
  pharmacyId: string;
  orderId?: string;
  invoiceNumber: string;
  issueDate?: string;
  issuedDate?: string;
  status: number;
  items?: InvoiceItem[];
}

interface Shipment {
  id: string;
  pharmacyId: string;
  orderId?: string;
  trackingNumber: string;
  status: number;
}

interface Pharmacy { id: string; name: string; }
interface Drug { id: string; name: string; barcode?: string; }

export default function ReturnList() {
  const [returns, setReturns] = useState<ReturnData[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [allReturnItems, setAllReturnItems] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State'leri
  const [isReturnModalVisible, setIsReturnModalVisible] = useState<boolean>(false);
  const [returnForm] = Form.useForm();
  const [editingReturnId, setEditingReturnId] = useState<string | null>(null);

  // İade & Stok Kabul Yönetimi Modal State'leri
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<InvoiceItem | null>(null);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const getEffectiveStatus = (record?: ReturnData | null): number => {
    if (!record) return 0;
    if (typeof record.status === 'number') return record.status;
    if (record.isApproved === true) return 1;
    return 0;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [returnRes, pharmRes, invRes, shipRes, drugRes, itemRes] = await Promise.all([
        api.get('/api/app/return'),
        api.get('/api/app/pharmacy'),
        api.get('/api/app/invoice'),
        api.get('/api/app/shipment'),
        api.get('/api/app/drug'),
        api.get('/api/app/return-item')
      ]);

      const returnList: ReturnData[] = returnRes.data.items || [];
      const invoiceList: Invoice[] = invRes.data.items || [];
      const shipmentList: Shipment[] = shipRes.data.items || [];

      const deliveredOrderIds = shipmentList
        .filter(s => s.status === 2 || (s as any).status === 'Delivered')
        .map(s => s.orderId)
        .filter(Boolean);

      const usedInvoiceIds = returnList
        .filter(r => r.id !== editingReturnId)
        .map(r => r.invoiceId)
        .filter(Boolean);

      const validCompletedInvoices = invoiceList.filter(i => {
        const isInvoicePaidOrIssued = i.status === 1 || i.status === 2;
        const isShipmentDelivered = i.orderId ? deliveredOrderIds.includes(i.orderId) : true; 
        const isNotAlreadyReturned = !usedInvoiceIds.includes(i.id);
        
        return isInvoicePaidOrIssued && isShipmentDelivered && isNotAlreadyReturned;
      });

      setReturns(returnList);
      setPharmacies(pharmRes.data.items || []);
      setAllInvoices(invoiceList);
      setInvoices(validCompletedInvoices);
      setDrugs(drugRes.data.items || []);
      setAllReturnItems(itemRes.data.items || []);
    } catch (error) {
      console.error('API Hatası:', error);
      message.error('İade verileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handlePharmacyChange = (pharmacyId: string) => {
    returnForm.setFieldsValue({ invoiceId: undefined });
    const matched = invoices.filter(i => i.pharmacyId === pharmacyId);
    setFilteredInvoices(matched);
  };

  const showAddReturnModal = () => {
    setEditingReturnId(null);
    returnForm.resetFields();
    setFilteredInvoices([]);
    
    const randomCode = Math.floor(100 + Math.random() * 900);
    returnForm.setFieldsValue({ 
      trackingNumber: `RET-${dayjs().format('YYYYMMDD')}-${randomCode}`,
      returnDate: dayjs(), 
      status: 0 
    });
    setIsReturnModalVisible(true);
  };

  const showEditReturnModal = (record: ReturnData) => {
    setEditingReturnId(record.id);
    const matched = invoices.filter(i => i.pharmacyId === record.pharmacyId);
    setFilteredInvoices(matched);

    returnForm.setFieldsValue({
      ...record,
      status: getEffectiveStatus(record),
      returnDate: record.returnDate ? dayjs(record.returnDate) : null
    });
    setIsReturnModalVisible(true);
  };

  const handleReturnSave = async (values: any) => {
    if (!values.invoiceId) {
      message.error('İade talebi oluşturabilmek için mutlaka resmi bir fatura seçmelisiniz!');
      return;
    }

    try {
      const selectedStatus = values.status ?? 0;
      const payload = {
        pharmacyId: values.pharmacyId,
        invoiceId: values.invoiceId,
        trackingNumber: values.trackingNumber,
        returnDate: values.returnDate ? values.returnDate.toISOString() : null,
        status: selectedStatus,
        isApproved: selectedStatus === 1
      };

      if (editingReturnId) {
        await api.put(`/api/app/return/${editingReturnId}`, payload);
        message.success('İade kaydı güncellendi.');
      } else {
        await api.post('/api/app/return', payload);
        message.success('Tamamlanmış fatura bağlantılı iade kaydı oluşturuldu.');
      }
      setIsReturnModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('İade kaydedilemedi.');
    }
  };

  const handleReturnDelete = async (id: string) => {
    try {
      await api.delete(`/api/app/return/${id}`);
      message.success('İade kaydı silindi.');
      fetchData();
    } catch (error) {
      message.error('Silme başarısız.');
    }
  };

  const showReturnDetails = async (returnData: ReturnData) => {
    setSelectedReturn(returnData);
    setIsDetailModalVisible(true);
    setLoadingItems(true);
    itemForm.resetFields();
    setSelectedInvoiceItem(null);

    try {
      const response = await api.get('/api/app/return-item');
      const allItems = response.data.items || [];
      const filteredItems = allItems.filter((item: ReturnItem) => item.returnId === returnData.id);
      setReturnItems(filteredItems);

      if (returnData.invoiceId) {
        try {
          const invRes = await api.get(`/api/app/invoice/${returnData.invoiceId}`);
          setSelectedInvoice(invRes.data || null);
        } catch {
          const inv = allInvoices.find(i => i.id === returnData.invoiceId);
          setSelectedInvoice(inv || null);
        }
      } else {
        setSelectedInvoice(null);
      }
    } catch (error) {
      message.error('İade detayları yüklenemedi.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSelectInvoiceItem = (drugId: string) => {
    if (!selectedInvoice || !selectedInvoice.items) return;
    const item = selectedInvoice.items.find(i => i.drugId === drugId);
    if (item) {
      // Geliştirilmiş eşleşme: drugId eşleşmese bile eğer faturada tek kalem varsa veya ri.drugId boşsa yakala
      const alreadyReturnedQty = returnItems
        .filter(ri => ri.drugId === drugId || !ri.drugId || ri.drugId === item.id)
        .reduce((sum, ri) => sum + (ri.quantity || 0), 0);

      const remainingQty = item.quantity - alreadyReturnedQty;

      setSelectedInvoiceItem({
        ...item,
        quantity: remainingQty > 0 ? remainingQty : 0 
      });
      itemForm.setFieldsValue({ quantity: remainingQty > 0 ? remainingQty : 1 });
    }
  };

  const handleAddItem = async (values: any) => {
    if (!selectedReturn || !selectedInvoiceItem) {
      message.error('Lütfen faturadan geçerli bir ilaç seçin.');
      return;
    }

    const originalInvoiceItem = selectedInvoice?.items?.find(i => i.drugId === selectedInvoiceItem.drugId);
    if (!originalInvoiceItem) {
      message.error('Orijinal fatura kalemi bulunamadı.');
      return;
    }

    const alreadyReturnedQty = returnItems
      .filter(ri => ri.drugId === selectedInvoiceItem.drugId || !ri.drugId || ri.drugId === selectedInvoiceItem.id)
      .reduce((sum, ri) => sum + (ri.quantity || 0), 0);

    const maxAllowed = originalInvoiceItem.quantity - alreadyReturnedQty;

    if (values.quantity > maxAllowed) {
      message.error(`Hata: Bu ilaçtan faturada kalan maksimum miktar sadece ${maxAllowed} Kutudur!`);
      return;
    }

    try {
      const qty = values.quantity;
      const unitPrice = selectedInvoiceItem.unitPrice || 85.50;
      const taxRate = selectedInvoiceItem.taxRate || 8;
      const lineTotal = qty * unitPrice * (1 + taxRate / 100);

      const payload = {
        returnId: selectedReturn.id,
        drugId: selectedInvoiceItem.drugId,
        quantity: qty,
        unitPrice: unitPrice,
        taxRate: taxRate,
        lineTotal: lineTotal,
        reason: values.reason
      };

      await api.post('/api/app/return-item', payload);
      message.success('İade kalemi eklendi.');
      itemForm.resetFields();
      setSelectedInvoiceItem(null);
      await showReturnDetails(selectedReturn);
      fetchData();
    } catch (error) {
      message.error('Kalem eklenemedi.');
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await api.delete(`/api/app/return-item/${id}`);
      message.success('Kalem silindi.');
      if (selectedReturn) showReturnDetails(selectedReturn);
      fetchData();
    } catch (error) {
      message.error('Silme başarısız.');
    }
  };

  const handleUpdateStatus = async (newStatus: number, statusText: string) => {
    if (!selectedReturn) return;
    try {
      const payload = {
        pharmacyId: selectedReturn.pharmacyId,
        invoiceId: selectedReturn.invoiceId,
        trackingNumber: selectedReturn.trackingNumber,
        returnDate: selectedReturn.returnDate,
        status: newStatus,
        isApproved: newStatus === 1
      };
      await api.put(`/api/app/return/${selectedReturn.id}`, payload);
      message.success(statusText);
      setSelectedReturn({ ...selectedReturn, status: newStatus, isApproved: newStatus === 1 });
      fetchData();
    } catch (error) {
      message.error('Durum güncellenemedi.');
    }
  };

  const renderStatusTag = (record?: ReturnData | null) => {
    const st = getEffectiveStatus(record);
    switch (st) {
      case 0: return <Tag icon={<SyncOutlined spin />} color="processing">İncelemede / Depo Kabul Bekliyor</Tag>;
      case 1: return <Tag icon={<CheckCircleOutlined />} color="success">Onaylandı & Stoğa Alındı</Tag>;
      case 2: return <Tag icon={<CloseCircleOutlined />} color="error">İade Reddedildi</Tag>;
      case 3: return <Tag icon={<AlertOutlined />} color="warning">Karantina / İmha Sevk Yapıldı</Tag>;
      default: return <Tag icon={<SyncOutlined spin />} color="processing">İncelemede</Tag>;
    }
  };

  const getReasonTag = (reason: number) => {
    switch (reason) {
      case 0: return <Tag color="volcano">SKT Geçmiş</Tag>;
      case 1: return <Tag color="red">Hasarlı Ambalaj</Tag>;
      case 2: return <Tag color="magenta">Toplatma / Karantina</Tag>;
      case 3: return <Tag color="orange">Yanlış Gönderim</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  const calculateTotalCredit = () => {
    return returnItems.reduce((acc, item) => {
      const price = item.unitPrice || 85.50;
      const tax = item.taxRate || 8;
      const total = item.lineTotal || (item.quantity * price * (1 + tax / 100));
      return acc + total;
    }, 0);
  };

  const returnColumns = [
    { 
      title: 'İade Fiş / Takip No', 
      dataIndex: 'trackingNumber', 
      key: 'trackingNumber', 
      render: (text: string, record: ReturnData) => (
        <Text strong style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => showReturnDetails(record)}>
          {text || 'RET-2026-000'}
        </Text>
      ) 
    },
    {
      title: 'İade Eden Eczane',
      key: 'pharmacy',
      render: (_: any, record: ReturnData) => {
        const pharm = pharmacies.find(p => p.id === record.pharmacyId);
        return pharm ? pharm.name : 'Bilinmiyor';
      }
    },
    {
      title: 'Bağlı Fatura No',
      key: 'invoice',
      render: (_: any, record: ReturnData) => {
        const inv = allInvoices.find(i => i.id === record.invoiceId);
        return inv ? <Text strong style={{ color: '#52c41a' }}>{inv.invoiceNumber}</Text> : <Tag color="red">Bağlantısız Fatura</Tag>;
      }
    },
    {
      title: 'Kalem Sayısı',
      key: 'itemCount',
      align: 'center' as const,
      render: (_: any, record: ReturnData) => {
        const count = allReturnItems.filter(i => i.returnId === record.id).length;
        return <Badge count={count} showZero overflowCount={99} style={{ backgroundColor: count > 0 ? '#1890ff' : '#d9d9d9' }} />;
      }
    },
    { 
      title: 'Tarih', 
      dataIndex: 'returnDate', 
      key: 'returnDate',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-' 
    },
    { 
      title: 'Depo Onay Durumu', 
      key: 'status',
      render: (_: any, record: ReturnData) => renderStatusTag(record)
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: ReturnData) => (
        <Space>
          <Button type="primary" icon={<RollbackOutlined />} onClick={() => showReturnDetails(record)}>
            Yönet & Onayla
          </Button>
          <Button ghost type="primary" icon={<EditOutlined />} onClick={() => showEditReturnModal(record)} />
          <Popconfirm title="İade kaydını silmek istediğinize emin misiniz?" onConfirm={() => handleReturnDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const itemColumns = [
    {
      title: 'Faturadaki İlaç Adı',
      key: 'drug',
      render: (_: any, record: ReturnItem) => {
        const drug = drugs.find(d => d.id === record.drugId);
        return (
          <div>
            <Text strong>{drug ? drug.name : 'Fatura İlacı'}</Text><br />
            <Text type="secondary" style={{ fontSize: '11px' }}>Barkod: {drug?.barcode || 'N/A'}</Text>
          </div>
        );
      }
    },
    { 
      title: 'İade Miktarı', 
      dataIndex: 'quantity', 
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number) => <Text strong>{qty} Kutu</Text>
    },
    { 
      title: 'Fatura Birim Fiyatı', 
      key: 'unitPrice',
      align: 'right' as const,
      render: (_: any, record: ReturnItem) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(record.unitPrice || 85.50)
    },
    { 
      title: 'Alacak Tutarı (KDV Dahil)', 
      key: 'lineTotal',
      align: 'right' as const,
      render: (_: any, record: ReturnItem) => {
        const price = record.unitPrice || 85.50;
        const tax = record.taxRate || 8;
        const total = record.lineTotal || (record.quantity * price * (1 + tax / 100));
        return <Text strong style={{ color: '#52c41a' }}>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total)}</Text>;
      }
    },
    { 
      title: 'İade Sebebi', 
      dataIndex: 'reason', 
      key: 'reason',
      render: (reason: number) => getReasonTag(reason)
    },
    {
      title: 'İşlem',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: ReturnItem) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.id)} />
      )
    }
  ];

  const currentPharmacyName = pharmacies.find(p => p.id === selectedReturn?.pharmacyId)?.name || 'Eczane Bilgisi Bulunamadı';
  const currentEffectiveStatus = getEffectiveStatus(selectedReturn);
  const totalReturnCredit = calculateTotalCredit();

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><RollbackOutlined style={{ color: '#ff7a00', marginRight: 12 }} />İade Yönetimi</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddReturnModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}>Yeni İade Kaydı</Button>}
      >
      {/* KPI Cards - Modern White Surface */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Toplam İade" value={returns.length} subtitle="iade kaydı" color="#FF7A00" icon={<RollbackOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="İncelemede" value={returns.filter(r => getEffectiveStatus(r) === 0).length} subtitle="bekliyor" color="#FAAD14" icon={<SyncOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Onaylanan" value={returns.filter(r => getEffectiveStatus(r) === 1).length} subtitle="kabul edildi" color="#059669" icon={<CheckCircleOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <KPICard title="Karantina / Diğer" value={returns.filter(r => getEffectiveStatus(r) >= 2).length} subtitle="reddedildi / askıda" color="#DC2626" icon={<CloseCircleOutlined />} />
          </Col>
        </Row>

        <Table dataSource={returns} columns={returnColumns} rowKey="id" loading={loading} bordered={false} size="middle" className="border border-slate-200 rounded-xl" />
      </Card>

      {/* İADE BİLGİLERİNİ DÜZENLE / YENİ İADE MODALI */}
      <Modal
        title={editingReturnId ? "İade Kaydını Düzenle" : "Tamamlanmış Fatura İçi İade Talebi Oluştur"}
        open={isReturnModalVisible}
        onCancel={() => setIsReturnModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form form={returnForm} layout="vertical" onFinish={handleReturnSave}>
          <Form.Item name="pharmacyId" label="İadeyi Veren Eczane" rules={[{ required: true, message: 'Eczane seçiniz' }]}>
            <Select placeholder="Eczane Seçin" showSearch optionFilterProp="children" onChange={handlePharmacyChange}>
              {pharmacies.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item 
            name="invoiceId" 
            label="İlgili Resmi Ve Teslim Edilmiş Fatura" 
            rules={[{ required: true, message: 'İade başlatılabilmesi için teslimatı tamamlanmış bir fatura seçilmelidir!' }]}
            help="Sadece sevkiyatı 'Eczane Teslim Aldı' statüsünde, faturası kesilmiş ve daha önce iade edilmemiş siparişler seçilebilir."
          >
            <Select placeholder="Önce Eczane Seçin" showSearch optionFilterProp="children">
              {filteredInvoices.map(i => (
                <Select.Option key={i.id} value={i.id}>
                  <FileTextOutlined /> Fatura No: {i.invoiceNumber} (Tarih: {i.issueDate ? dayjs(i.issueDate).format('DD.MM.YYYY') : '-'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="trackingNumber" label="İade / Takip Numarası" rules={[{ required: true, max: 100 }]}>
                <Input placeholder="Örn: RET-2026-001" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="returnDate" label="İade Tarihi" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="İade Durumu">
            <Select placeholder="Durum Seçin">
              <Select.Option value={0}>Talep Edildi / İncelemede</Select.Option>
              <Select.Option value={1}>Onaylandı (Stoğa Alındı)</Select.Option>
              <Select.Option value={3}>Karantinaya Alındı / İmha</Select.Option>
              <Select.Option value={2}>Reddedildi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', margin: 0, marginTop: '16px' }}>
            <Button onClick={() => setIsReturnModalVisible(false)} style={{ marginRight: '8px' }}>İptal</Button>
            <Button type="primary" htmlType="submit">Kaydet</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* İADE VE STOK ONAY YÖNETİMİ MODALI */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
            <span><SolutionOutlined /> {selectedReturn?.trackingNumber || 'RET-2026'} İade & Stok Kabul Yönetimi</span>
            {currentEffectiveStatus === 0 && (
              <Space>
                <Button type="primary" icon={<CheckOutlined />} onClick={() => handleUpdateStatus(1, 'İade onaylandı. Ürünler depo stoğuna eklendi ve eczane hesabına alacak yazıldı.')}>
                  Stoğa Al & Onayla
                </Button>
                <Button danger icon={<AlertOutlined />} onClick={() => handleUpdateStatus(3, 'Ürünler imha/karantinaya alındı. Stok artışı yapılmadı.')}>
                  Karantinaya Al
                </Button>
              </Space>
            )}
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={980}
        footer={[<Button key="close" onClick={() => setIsDetailModalVisible(false)}>Kapat</Button>]}
      >
        {/* Üst Bilgi ve Finansal Alacak Özeti */}
        {selectedReturn && (
          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e8e8e8' }}>
            <Row gutter={[16, 12]} align="middle">
              <Col span={6}>
                <Text type="secondary">Eczane:</Text><br />
                <Text strong style={{ fontSize: '15px' }}>{currentPharmacyName}</Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">Bağlı Fatura No:</Text><br />
                <Text strong style={{ fontSize: '15px', color: selectedInvoice ? '#1890ff' : '#ff4d4f' }}>
                  {selectedInvoice?.invoiceNumber || 'Geçerli Fatura Bulunamadı'}
                </Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">İade İşlem Durumu:</Text><br />
                {renderStatusTag(selectedReturn)}
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Text type="secondary">Hesaplanacak Alacak Dekontu:</Text><br />
                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalReturnCredit)}
                </Text>
              </Col>
            </Row>
          </div>
        )}

        {/* Fatura Kalemleri Üzerinden İade Seçimi Paneli */}
        {currentEffectiveStatus === 0 && selectedInvoice?.items && selectedInvoice.items.length > 0 && (
          <Card size="small" title="Seçilen Faturadaki Kalemlerden İade Ekle" style={{ marginBottom: '20px', background: '#fff' }}>
            <Form form={itemForm} layout="inline" onFinish={handleAddItem} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Form.Item name="drugId" rules={[{ required: true, message: 'Faturadan ilaç seçin' }]} style={{ flex: 3, minWidth: '280px' }}>
                <Select placeholder="Faturada Kesilmiş İlacı Seçin" showSearch optionFilterProp="children" onChange={handleSelectInvoiceItem}>
                  {selectedInvoice.items
                    .filter(item => {
                      const returnedQty = returnItems
                        .filter(ri => ri.drugId === item.drugId || !ri.drugId || ri.drugId === item.id)
                        .reduce((sum, ri) => sum + (ri.quantity || 0), 0);
                      return returnedQty < item.quantity;
                    })
                    .map(item => {
                      const d = drugs.find(drug => drug.id === item.drugId);
                      const returnedQty = returnItems
                        .filter(ri => ri.drugId === item.drugId || !ri.drugId || ri.drugId === item.id)
                        .reduce((sum, ri) => sum + (ri.quantity || 0), 0);
                      const remaining = item.quantity - returnedQty;

                      return (
                        <Select.Option key={item.id} value={item.drugId}>
                          {d ? d.name : 'İlaç'} — Kalan: {remaining} / Toplam: {item.quantity} Adet | Birim Fiyat: ₺{item.unitPrice}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>

              <Form.Item name="quantity" rules={[{ required: true, message: 'Miktar' }]} style={{ flex: 1, minWidth: '110px' }}>
                <InputNumber 
                  placeholder="Adet" 
                  min={1} 
                  max={selectedInvoiceItem ? selectedInvoiceItem.quantity : 1000} 
                  style={{ width: '100%' }} 
                  addonAfter="Kutu" 
                />
              </Form.Item>

              <Form.Item name="reason" rules={[{ required: true, message: 'Sebep' }]} style={{ flex: 1, minWidth: '140px' }}>
                <Select placeholder="İade Nedeni">
                  <Select.Option value={0}>SKT Geçmiş</Select.Option>
                  <Select.Option value={1}>Hasarlı Ambalaj</Select.Option>
                  <Select.Option value={2}>Toplatma/Karantina</Select.Option>
                  <Select.Option value={3}>Yanlış Gönderim</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Ekle</Button>
              </Form.Item>
            </Form>

            {selectedInvoiceItem && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                * Bu kalem için eklenebilecek <b>maksimum kalan miktar: {selectedInvoiceItem.quantity} Kutu</b>.
              </div>
            )}
          </Card>
        )}

        {currentEffectiveStatus === 0 && (!selectedInvoice?.items || selectedInvoice.items.length === 0) && (
          <div style={{ padding: '16px', background: '#fff2f0', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffccc7' }}>
            <Text type="danger">İade oluşturulabilmesi için teslim edilmiş ve faturası kesinleşmiş bir fatura bağlantısı gereklidir.</Text>
          </div>
        )}
        
        {/* İade Kalemleri Tablosu */}
        <Table
          dataSource={returnItems}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          size="middle"
          loading={loadingItems}
          bordered={false}
          className="border border-slate-200 rounded-xl"
        />
      </Modal>
    </div>
  );
}