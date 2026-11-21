import { useState } from 'react';
import {
  Form, Input, Button, Typography, message, Card, Space, Alert, Row, Col,
} from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { accountApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface DemoAccount {
  user: string;
  pass: string;
  role: string;
  color: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { user: 'mehmutzortmaz', pass: 'Admin123!', role: 'Yönetici', color: '#FF7A00' },
  { user: 'eczane_ahmet', pass: 'Pharmacy123!', role: 'Eczacı', color: '#EC4899' },
  { user: 'depo_ayse', pass: 'Warehouse123!', role: 'Depocu', color: '#10B981' },
  { user: 'tedarikci_mustafa', pass: 'Supplier123!', role: 'Tedarikçi', color: '#3B82F6' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await accountApi.post('/login', {
        userNameOrEmailAddress: values.username,
        password: values.password,
      });

      const accessToken = response.data?.result?.accessToken;
      if (accessToken) localStorage.setItem('token', accessToken);

      const u = values.username.toLowerCase();
      let assignedRole = 'admin';
      if (u.includes('eczane') || u.includes('ahmet')) assignedRole = 'pharmacy';
      else if (u.includes('tedarikci') || u.includes('mustafa')) assignedRole = 'supplier';
      else if (u.includes('depo') || u.includes('ayse')) assignedRole = 'warehouse';
      else if (u.includes('sales') || u.includes('cemal')) assignedRole = 'sales';

      localStorage.setItem('role', assignedRole);
      localStorage.setItem('username', values.username);

      message.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      navigate(`/${assignedRole}`);
    } catch (error: any) {
      const msg = error?.response?.data?.description || error?.response?.data?.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.';
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

        {/* Sol: Brand Panel */}
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
              Sağlık &amp; Tedarik Zinciri<br />
              Yönetim Sistemi
            </Text>
          </div>

          <Card
            title={<Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>Hızlı Erişim (Demo)</Title>}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>Kullanıcı bilgileri otomatik doldurulur</Text>
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
                • {DEMO_ACCOUNTS[0].user} / {DEMO_ACCOUNTS[0].pass}<br />
                • {DEMO_ACCOUNTS[1].user} / {DEMO_ACCOUNTS[1].pass}<br />
                • {DEMO_ACCOUNTS[2].user} / {DEMO_ACCOUNTS[2].pass}
              </Text>
            </div>
          </Card>

          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11 }}>
            © 2024 MediFlow ERP. Tüm hakları saklıdır.
          </div>
        </div>

        {/* Sağ: Giriş Formu */}
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
                Hesabınıza giriş yapın
              </Title>
              <Text type="secondary" style={{ fontSize: 14, color: '#64748B' }}>
                MediFlow ERP yönetim paneline erişmek için bilgilerinizi giriniz.
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
                    <UserOutlined style={{ color: '#FF7A00', marginRight: 8 }} /> Kullanıcı Adı / E-posta
                  </span>
                }
                rules={[{ required: true, message: 'Kullanıcı adı veya e-posta gereklidir!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="Örn: mehmutzortmaz veya admin@mediflow.local"
                  size="large"
                  style={{ borderRadius: 10, height: 46, fontSize: 14 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    <LockOutlined style={{ color: '#FF7A00', marginRight: 8 }} /> Şifre
                  </span>
                }
                rules={[{ required: true, message: 'Şifre gereklidir!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                  placeholder="••••••••"
                  size="large"
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
                    message.info('Şifre sıfırlama özelliği yakında aktif olacak.');
                  }}
                >
                  Şifremi unuttum
                </a>
              </Form.Item>
            </Form>

            <Alert
              message="Giriş Bilgisi"
              description="Demo hesabı seçerek hızlıca giriş yapabilirsiniz. Tüm demo hesapların şifreleri yukarıdaki kartta listelenmiştir."
              type="info"
              showIcon
              style={{ marginBottom: 20, borderRadius: 10, fontSize: 13 }}
            />

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
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Form.Item>
          </Card>

          <div style={{ marginTop: 16, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
            MediFlow ERP — Sağlık Tedarik Zinciri Yönetimi
          </div>
        </div>

      </div>

      {/* Mobil: altda dağılan layout için media query */}
      <style>{`
        @media (max-width: 768px) {
          .login-wrapper { flex-direction: column !important; }
          .brand-panel { border-right: none !important; border-bottom: 1px solid #E2E8F0 !important; padding-right: 0 !important; padding-bottom: 24px !important; }
          .form-panel { max-width: 100% !important; min-width: auto !important; }
        }
      `}</style>
    </div>
  );
}
