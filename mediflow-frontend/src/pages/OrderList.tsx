import { useEffect, useState } from 'react';
import {
  Table, Typography, message, Card, Button, Modal, Form, Input,
  Select, DatePicker, Tag, Space, Popconfirm, InputNumber, Row, Col,
  Drawer, Divider, Badge, Descriptions, Empty, Tooltip, Statistic
} from 'antd';
import {
  ShoppingOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, SaveOutlined,
  MinusCircleOutlined, CheckOutlined, InboxOutlined, ShoppingCartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

interface Order {
  id: string;
  pharmacyId: string;
  orderNumber: string;
  orderDate: string;
  status: number;
  notes: string;
  totalAmount?: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  drugId: string;
  requestedQuantity: number;
  approvedQuantity: number;
}

interface StockBatch {
  id: string;
  drugId: string;
  warehouseId: string;
  supplierId: string;
  lotNumber: string;
  expirationDate: string;
  quantity: number;
  reservedQuantity: number;
  shelfLocation: string;
  isQuarantined: boolean;
}

interface Pharmacy { id: string; name: string; }
interface Drug { id: string; name: string; }

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<OrderItem[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [isOrderModalVisible, setIsOrderModalVisible] = useState<boolean>(false);
  const [orderForm] = Form.useForm();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemForm] = Form.useForm();

  const [approvalQuantities, setApprovalQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, pharmRes, drugRes, itemsRes, stockRes] = await Promise.all([
        api.get('/order'),
        api.get('/pharmacy'),
        api.get('/drug'),
        api.get('/order-item'),
        api.get('/stock-batch')
      ]);
      setOrders(orderRes.data.items || []);
      setPharmacies(pharmRes.data.items || []);
      setDrugs(drugRes.data.items || []);
      setAllOrderItems(itemsRes.data.items || []);
      setStockBatches(stockRes.data.items || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Sipariş ve stok verileri yüklenirken bir hata oluştu.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStockForDrug = (drugId: string): number => {
    const now = dayjs();
    return stockBatches
      .filter(batch =>
        batch.drugId === drugId &&
        !batch.isQuarantined &&
        dayjs(batch.expirationDate).isAfter(now, 'day')
      )
      .reduce((total, batch) => {
        const netQty = Math.max(0, (batch.quantity || 0) - (batch.reservedQuantity || 0));
        return total + netQty;
      }, 0);
  };

  const updateOrderStatusBasedOnItems = async (order: Order, items: OrderItem[]) => {
    if (!order) return;
    let newStatus = order.status;
    if (order.status === 2 || order.status === 3) return;

    if (items.length === 0) {
      newStatus = 0;
    } else {
      let allApproved = true;
      let hasPartial = false;
      let allZero = true;

      items.forEach(item => {
        if (item.approvedQuantity > 0) allZero = false;
        if (item.approvedQuantity < item.requestedQuantity && item.approvedQuantity > 0) hasPartial = true;
        if (item.approvedQuantity !== item.requestedQuantity) allApproved = false;
      });

      if (allZero) {
        newStatus = 0;
      } else if (allApproved) {
        newStatus = 1;
      } else if (hasPartial || (!allApproved && !allZero)) {
        newStatus = 4;
      }
    }

    if (newStatus !== order.status) {
      const orderPayload = { ...order, status: newStatus };
      await api.put(`/order/${order.id}`, orderPayload);
      setSelectedOrder(orderPayload);
      fetchData();
    }
  };

  const generateOrderNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dayjs().year()}-${randomNum}`;
  };

  const showAddOrderModal = () => {
    setEditingOrderId(null);
    orderForm.resetFields();
    orderForm.setFieldsValue({
      status: 0,
      orderDate: dayjs(),
      orderNumber: generateOrderNumber(),
      items: [{ drugId: undefined, requestedQuantity: 10 }]
    });
    setIsOrderModalVisible(true);
  };

  const showEditOrderModal = (record: Order) => {
    setEditingOrderId(record.id);
    orderForm.setFieldsValue({
      ...record,
      orderDate: record.orderDate ? dayjs(record.orderDate) : null
    });
    setIsOrderModalVisible(true);
  };

  const handleOrderSave = async (values: any) => {
    try {
      setSubmitting(true);
      const items = values.items || [];
      const orderPayload = {
        pharmacyId: values.pharmacyId,
        orderNumber: values.orderNumber,
        orderDate: values.orderDate ? values.orderDate.toISOString() : null,
        status: values.status ?? 0,
        notes: values.notes,
        // [F4] Bulk item creation — Items listesi ile tek çağrı
        items: items.map((item: any) => ({
          drugId: item.drugId,
          requestedQuantity: item.requestedQuantity,
        })),
      };

      if (editingOrderId) {
        await api.put(`/order/${editingOrderId}`, orderPayload);
        message.success('Sipariş bilgileri güncellendi.');
      } else {
        const orderRes = await api.post('/order', orderPayload);
        message.success(`Sipariş ve ${items.length} ilaç kalemi başarıyla oluşturuldu!`);
      }
      setIsOrderModalVisible(false);
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Sipariş kaydedilemedi.';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderDelete = async (id: string) => {
    try {
      const relatedItems = allOrderItems.filter(i => i.orderId === id);
      for (const item of relatedItems) {
        await api.delete(`/order-item/${item.id}`);
      }
      await api.delete(`/order/${id}`);
      message.success('Sipariş silindi.');
      if (selectedOrder?.id === id) setIsDetailDrawerVisible(false);
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || 'Silme işlemi başarısız.';
      message.error(errorMsg);
    }
  };

  const refreshOrderItems = async (order: Order) => {
    const [itemsRes, stockRes] = await Promise.all([
      api.get('/order-item'),
      api.get('/stock-batch')
    ]);
    const allItems: OrderItem[] = itemsRes.data.items || [];
    setAllOrderItems(allItems);
    setStockBatches(stockRes.data.items || []);

    const filteredItems = allItems.filter((item: OrderItem) => item.orderId === order.id);
    setOrderItems(filteredItems);

    const qtyMap: Record<string, number> = {};
    filteredItems.forEach(item => {
      qtyMap[item.id] = item.approvedQuantity;
    });
    setApprovalQuantities(qtyMap);
    await updateOrderStatusBasedOnItems(order, filteredItems);
  };

  const showOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDrawerVisible(true);
    setLoadingItems(true);
    itemForm.resetFields();
    try {
      await refreshOrderItems(order);
    } catch (error: any) {
      message.error('Sipariş kalemleri yüklenemedi.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddItem = async (values: any) => {
    if (!selectedOrder) return;
    try {
      const payload = {
        orderId: selectedOrder.id,
        drugId: values.drugId,
        requestedQuantity: values.requestedQuantity,
        approvedQuantity: 0
      };
      await api.post('/order-item', payload);
      await refreshOrderItems(selectedOrder);
      message.success('İlaç kalemi siparişe eklendi.');
      itemForm.resetFields();
    } catch (error: any) {
      message.error('Kalem eklenemedi.');
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!selectedOrder) return;
    try {
      await api.delete(`/order-item/${id}`);
      await refreshOrderItems(selectedOrder);
      message.success('Kalem silindi.');
    } catch (error: any) {
      message.error('Silme başarısız.');
    }
  };

  const handleApproveItem = async (record: OrderItem, customQty?: number) => {
    if (!selectedOrder) return;
    const newApprovedQty = customQty !== undefined ? customQty : (approvalQuantities[record.id] ?? record.approvedQuantity);
    if (newApprovedQty === record.approvedQuantity) {
      message.info('Bu miktar zaten onaylanmış durumda.');
      return;
    }
    const availableStock = getAvailableStockForDrug(record.drugId);
    const maxAllowedForThisItem = availableStock + (record.approvedQuantity || 0);
    if (newApprovedQty > record.requestedQuantity) {
      message.error(`Talep edilenden fazla (${record.requestedQuantity} kutu) onaylanamaz!`);
      return;
    }
    if (newApprovedQty > maxAllowedForThisItem) {
      message.warning(`Depoda yeterli kullanılabilir stok yok! Maksimum onaylanabilir: ${maxAllowedForThisItem} Kutu.`);
      return;
    }
    try {
      setLoadingItems(true);
      await api.put(`/order-item/${record.id}`, {
        orderId: record.orderId,
        drugId: record.drugId,
        requestedQuantity: record.requestedQuantity,
        approvedQuantity: newApprovedQty
      });
      await refreshOrderItems(selectedOrder);
      message.success(`Başarıyla onaylandı! (Onay: ${newApprovedQty} Kutu)`);
    } catch (error: any) {
      message.error('Onaylama işlemi başarısız oldu.');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleApproveAllItems = async () => {
    if (!selectedOrder || orderItems.length === 0) return;
    try {
      setLoadingItems(true);
      let stockShortageCount = 0;
      let updatedCount = 0;
      for (const item of orderItems) {
        const availableStock = getAvailableStockForDrug(item.drugId) + (item.approvedQuantity || 0);
        const safeApproveQty = Math.min(item.requestedQuantity, availableStock);
        if (safeApproveQty < item.requestedQuantity) stockShortageCount++;
        if (safeApproveQty === item.approvedQuantity) continue;
        await api.put(`/order-item/${item.id}`, {
          orderId: item.orderId,
          drugId: item.drugId,
          requestedQuantity: item.requestedQuantity,
          approvedQuantity: safeApproveQty
        });
        updatedCount++;
      }
      await refreshOrderItems(selectedOrder);
      if (stockShortageCount > 0) message.warning(`${stockShortageCount} kalemde depo stoğu yetersiz!`);
      else if (updatedCount > 0) message.success('Sipariş kalemleri onaylandı!');
      else message.info('Değişiklik bulunmuyor.');
    } catch (error) {
      message.error('Toplu onaylama hatası.');
    } finally {
      setLoadingItems(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag icon={<SyncOutlined spin />} color="processing">Bekliyor</Tag>;
      case 1: return <Tag icon={<CheckCircleOutlined />} color="success">Onaylandı</Tag>;
      case 2: return <Tag color="purple">Tamamlandı</Tag>;
      case 3: return <Tag icon={<CloseCircleOutlined />} color="error">İptal</Tag>;
      case 4: return <Tag icon={<WarningOutlined />} color="warning">Kısmi Onay</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  const renderDrugOptions = () => drugs.map(d => {
    const availStock = getAvailableStockForDrug(d.id);
    return (
      <Select.Option key={d.id} value={d.id} label={d.name}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{d.name}</span>
          <Tag color={availStock > 0 ? 'green' : 'red'}>Stok: {availStock}</Tag>
        </div>
      </Select.Option>
    );
  });

  const orderColumns = [
    { title: 'Sipariş No', dataIndex: 'orderNumber', key: 'orderNumber', render: (text: string, record: Order) => <Button type="link" onClick={() => showOrderDetails(record)}>{text}</Button> },
    { title: 'Eczane', key: 'pharmacy', render: (_: any, r: Order) => <Text strong>{pharmacies.find(p => p.id === r.pharmacyId)?.name || '-'}</Text> },
    { title: 'Kalem', key: 'items', render: (_: any, r: Order) => <Badge count={allOrderItems.filter(i => i.orderId === r.id).length} /> },
    { title: 'Tarih', dataIndex: 'orderDate', key: 'orderDate', render: (d: string) => d ? new Date(d).toLocaleDateString('tr-TR') : '-' },
    { title: 'Durum', dataIndex: 'status', key: 'status', render: (s: number) => getStatusTag(s) },
    { title: 'İşlemler', key: 'actions', render: (_: any, r: Order) => (
      <Space>
        <Button type="primary" icon={<ShoppingOutlined />} onClick={() => showOrderDetails(r)}>Detay</Button>
        <Button icon={<EditOutlined />} onClick={() => showEditOrderModal(r)} />
        <Popconfirm title="Sil?" onConfirm={() => handleOrderDelete(r.id)}><Button danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )}
  ];

  const itemColumns = [
    { title: 'İlaç', key: 'drug', render: (_: any, r: OrderItem) => <Text strong>{drugs.find(d => d.id === r.drugId)?.name || '?'}</Text> },
    { title: 'Talep', dataIndex: 'requestedQuantity', key: 'req', render: (q: number) => <Tag color="blue">{q}</Tag> },
    { title: 'Onay', key: 'approve', render: (_: any, r: OrderItem) => (
      <Space>
        <InputNumber value={approvalQuantities[r.id] ?? r.approvedQuantity} onChange={(v) => setApprovalQuantities(prev => ({...prev, [r.id]: Number(v)}))} />
        <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => handleApproveItem(r)}>Onayla</Button>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={2} style={{ margin: 0, fontWeight: 700 }}><ShoppingCartOutlined style={{ color: '#ff7a00', marginRight: 12 }} />Sipariş Yönetimi</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={showAddOrderModal} size="large" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10, boxShadow: '0 4px 15px rgba(255, 122, 0, 0.3)' }}>Yeni Sipariş</Button>}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}><Card size="small" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}><Statistic title={<span style={{color:'white'}}>Toplam Sipariş</span>} value={orders.length} valueStyle={{color:'white'}}/></Card></Col>
          <Col span={6}><Card size="small" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}><Statistic title={<span style={{color:'white'}}>Onay Bekleyen</span>} value={orders.filter(o=>o.status===0).length} valueStyle={{color:'white'}}/></Card></Col>
          <Col span={6}><Card size="small" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}><Statistic title={<span style={{color:'white'}}>Onaylanan</span>} value={orders.filter(o=>o.status===1).length} valueStyle={{color:'white'}}/></Card></Col>
          <Col span={6}><Card size="small" style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)' }}><Statistic title={<span style={{color:'white'}}>Tamamlanan</span>} value={orders.filter(o=>o.status===2).length} valueStyle={{color:'white'}}/></Card></Col>
        </Row>
        <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={loading} />
      </Card>

      {/* ANA SİPARİŞ MODALI */}
      <Modal
        title={editingOrderId ? "Sipariş Bilgilerini Düzenle" : "Yeni Sipariş ve İçerik Oluştur"}
        open={isOrderModalVisible}
        onCancel={() => setIsOrderModalVisible(false)}
        width={780}
        footer={null}
      >
        <Form form={orderForm} layout="vertical" onFinish={handleOrderSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pharmacyId" label="Siparişi Veren Eczane" rules={[{ required: true, message: 'Eczane seçiniz' }]}>
                <Select placeholder="Eczane Seçin" showSearch optionFilterProp="children">
                  {pharmacies.map(p => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="orderNumber" label="Sipariş Numarası" rules={[{ required: true, max: 50 }]}>
                <Input placeholder="ORD-2026-001" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="orderDate" label="Sipariş Tarihi" rules={[{ required: true }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {editingOrderId && (
              <Col span={8}>
                <Form.Item name="status" label="Sipariş Durumu">
                  <Select>
                    <Select.Option value={0}>Bekliyor</Select.Option>
                    <Select.Option value={1}>Onaylandı</Select.Option>
                    <Select.Option value={2}>Tamamlandı/Sevk Edildi</Select.Option>
                    <Select.Option value={3}>İptal Edildi</Select.Option>
                    <Select.Option value={4}>Kısmi Onaylandı</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={editingOrderId ? 16 : 24}>
              <Form.Item name="notes" label="Sipariş Notu">
                <Input placeholder="Örn: Acil sevkiyat, soğuk zincir dikkat vb." />
              </Form.Item>
            </Col>
          </Row>

          {!editingOrderId && (
            <>
              <Divider orientation="left" style={{ margin: '12px 0' }}>Sipariş Edilecek İlaçlar (Canlı Depo Stoklu)</Divider>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={15}>
                          <Form.Item
                            {...restField}
                            name={[name, 'drugId']}
                            rules={[{ required: true, message: 'İlaç seçin' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="İlaç Seçin (Anlık Stok Gösterimli)"
                              showSearch
                              optionFilterProp="label"
                            >
                              {renderDrugOptions()}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'requestedQuantity']}
                            rules={[{ required: true, message: 'Miktar girin' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber placeholder="Kutu Adedi" min={1} style={{ width: '100%' }} addonAfter="Kutu" />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ textAlign: 'center' }}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }}
                            />
                          )}
                        </Col>
                      </Row>
                    ))}
                    <Form.Item style={{ marginTop: 12 }}>
                      <Button type="dashed" onClick={() => add({ requestedQuantity: 10 })} block icon={<PlusOutlined />}>
                        Başka İlaç Satırı Ekle
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}

          <Form.Item style={{ textAlign: 'right', margin: '16px 0 0 0' }}>
            <Button onClick={() => setIsOrderModalVisible(false)} style={{ marginRight: '8px' }}>İptal</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingOrderId ? 'Güncelle' : 'Siparişi ve Kalemleri Oluştur'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* DETAY DRAWER */}
      <Drawer
        title={selectedOrder ? `${selectedOrder.orderNumber} - Sipariş ve Stok Onay Yönetimi` : 'Sipariş Detayları'}
        open={isDetailDrawerVisible}
        onClose={() => setIsDetailDrawerVisible(false)}
        width={880}
        extra={
          orderItems.length > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={loadingItems}
              disabled={loadingItems}
              onClick={handleApproveAllItems}
              style={{ background: 'linear-gradient(135deg, #ff7a00, #ff9e4d)', borderColor: 'transparent', borderRadius: 10 }}
            >
              Stok Dahilinde Tümünü Onayla
            </Button>
          )
        }
      >
        {selectedOrder && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Eczane">
                <Text strong>{pharmacies.find(p => p.id === selectedOrder.pharmacyId)?.name || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sipariş Durumu">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Sipariş Tarihi">
                {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('tr-TR') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Notlar">
                {selectedOrder.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="Siparişe Yeni İlaç Ekle" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Form form={itemForm} layout="inline" onFinish={handleAddItem}>
                <Form.Item name="drugId" rules={[{ required: true, message: 'İlaç Seçin' }]} style={{ flex: 1 }}>
                  <Select placeholder="İlaç Seçin (Canlı Stok)" style={{ width: '100%' }} showSearch optionFilterProp="label">
                    {renderDrugOptions()}
                  </Select>
                </Form.Item>
                <Form.Item name="requestedQuantity" rules={[{ required: true, message: 'Miktar' }]}>
                  <InputNumber placeholder="Miktar" min={1} style={{ width: 140 }} addonAfter="Kutu" />
                </Form.Item>
                <Form.Item style={{ marginRight: 0 }}>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} disabled={loadingItems}>Ekle</Button>
                </Form.Item>
              </Form>
            </Card>

            <Table
              dataSource={orderItems}
              columns={itemColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              loading={loadingItems}
              bordered
              locale={{ emptyText: <Empty description="Bu siparişte henüz ilaç kalemi bulunmuyor." /> }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}