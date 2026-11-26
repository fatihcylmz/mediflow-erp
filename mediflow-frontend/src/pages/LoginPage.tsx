import { useState } from 'react';
import {
  Form, Input, Button, Typography, message, Card, Space, Alert,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface DemoAccount {
  user: string;
  pass: string;
  role: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { user: 'admin_mehmet', pass: 'Admin123!', role: 'Admin', color: '#FF7A00' },
  { user: 'eczane_ahmet', pass: 'Pharmacy123!', role: 'Eczaci', color: '#EC4899' },
  { user: 'depo_ayse', pass: 'Warehouse123!', role: 'Depocu', color: '#10B981' },
  { user: 'tedarikci_mustafa', pass: 'Supplier123!', role: 'Tedarikci', color: '#3B82F6' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      // Use custom AuthController login endpoint (works with HTTP)
      const response = await api.post('/api/app/auth/login', {
        userName: values.username,
        password: values.password,
      });

      const accessToken = response.data?.accessToken || response.data?.token;
      if (accessToken) localStorage.setItem('token', accessToken);

      // Decode JWT to get roles - handle both 'role' and long claim type
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const roles: string[] = Array.isArray(payload['role']) ? payload['role'] :
                              (payload['role'] ? [payload['role']] :
                              (Array.isArray(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) ? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] :
                              (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ? [payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']] : [])));
      const assignedRoleMap: Record<string, string> = {
        admin: 'admin',
        pharmacyadmin: 'pharmacy',
        warehouseadmin: 'warehouse',
        supplier: 'supplier',
        sales: 'sales',
      };
      const matchedRole = roles.find(r => Object.keys(assignedRoleMap).includes(r.toLowerCase()));
      const assignedRole = matchedRole ? assignedRoleMap[matchedRole.toLowerCase()] : 'admin';

      localStorage.setItem('role', assignedRole);
      localStorage.setItem('username', values.username);

      message.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate(`/${assignedRole}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error_description || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (user: string, pass: string) => {
    form.setFieldsValue({ username: user, password: pass });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e9ecef 100%)',
        padding: 24,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: 1000, display: 'flex', gap: 32, alignItems: 'center' }}>

        <div
          style={{
            flex: 1,
            minWidth: 300,
            paddingRight: 48,
            borderRight: '1px solid #E2E8F0',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #FF7A00, #FF9E4D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px -4px rgba(255,122,0,0.35)',
              }}
            >
              <SafetyCertificateOutlined style={{ fontSize: 36, color: '#fff' }} />
            </div>
            <Title level={2} style={{ margin: '0 0 10px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              MediFlow ERP
            </Title>
            <Text type="secondary" style={{ fontSize: 15, letterSpacing: '0.01em', lineHeight: 1.6 }}>
              Saglik & Tedarik Zinciri<br />
              Yonetim Sistemi
            </Text>
          </div>

          <Card
            title={<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>Hizli Erisim (Demo)</Title>}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>Kullanici bilgileri otomatik doldurulur</Text>
            }
            style={{ marginBottom: 24 }}
          >
            <Space wrap size={8} style={{ width: '100%', marginBottom: 16 }}>
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  onClick={() => setDemoAccount(acc.user, acc.pass)}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = acc.color;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px -4px ${acc.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: acc.color }}>{acc.role}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{acc.user}</span>
                </button>
              ))}
            </Space>

            <div style={{ background: '#FFF7ED', borderRadius: 10, padding: 14, border: '1px solid #FFE7BA' }}>
              <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                <strong>Demo Hesaplar:</strong><br />
                * {DEMO_ACCOUNTS[0].user} / {DEMO_ACCOUNTS[0].pass}<br />
                * {DEMO_ACCOUNTS[1].user} / {DEMO_ACCOUNTS[1].pass}<br />
                * {DEMO_ACCOUNTS[2].user} / {DEMO_ACCOUNTS[2].pass}<br />
                * {DEMO_ACCOUNTS[3].user} / {DEMO_ACCOUNTS[3].pass}
              </Text>
            </div>
          </Card>

          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11 }}>
            © 2024 MediFlow ERP. Tum haklari saklidir.
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 340, maxWidth: 420 }}>
          <Card
            size="small"
            style={{
              borderRadius: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <Title level={4} style={{ margin: '0 0 8px', fontWeight: 800, color: '#0F172A' }}>
                Hesabiniza giris yapin
              </Title>
              <Text type="secondary" style={{ fontSize: 14, color: '#64748B' }}>
                MediFlow ERP yonetim paneline erismek icin bilgilerinizi giriniz.
              </Text>
            </div>

            <Form
              form={form}
              initialValues={{ username: '', password: '' }}
              onFinish={handleLogin}
              layout="vertical"
              style={{ marginBottom: 20 }}
            >
              <Form.Item
                name="username"
                label={
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    <UserOutlined style={{ color: '#FF7A00', marginRight: 8 }} /> Kullanici Adi / E-posta
                  </span>
                }
                rules={[{ required: true, message: 'Kullanici adi veya e-posta gereklidir!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="Orn: admin_mehmet veya admin@mediflow.local"
                  size="large"
                  autoComplete="username"
                  style={{ borderRadius: 10, height: 46, fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    <LockOutlined style={{ color: '#FF7A00', marginRight: 8 }} /> Sifre
                  </span>
                }
                rules={[{ required: true, message: 'Sifre gereklidir!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="••••••••"
                  size="large"
                  autoComplete="current-password"
                  style={{ borderRadius: 10, height: 46, fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <a
                  href="#"
                  style={{
                    color: '#FF7A00',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    message.info('Sifre sifirlama ozelligi yakinda aktif olacak.');
                  }}
                >
                  Sifremi unuttum
                </a>
              </Form.Item>

              <Form.Item style={{ textAlign: 'center', margin: '16px 0 0 0' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #FF7A00, #FF9E4D)',
                    borderColor: 'transparent',
                    height: 48,
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: '0 8px 20px -4px rgba(255,122,0,0.35)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {loading ? 'Giris yapiliyorsa...' : 'Giris Yap'}
                </Button>
              </Form.Item>
            </Form>

            <Alert
              title="Giris Bilgisi"
              description="Demo hesabı seçerek hızlıca giriş yapabilirsiniz. Tüm demo hesapların şifreleri yukarıdaki kartta listelenmiştir."
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 10, fontSize: 13 }}
            />
          </Card>

          <div style={{ marginTop: 16, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
            MediFlow ERP — Sağlık Tedarik Zinciri Yönetimi
          </div>
        </div>

      </div>
    </div>
  );
}
