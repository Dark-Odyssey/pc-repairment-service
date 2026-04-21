import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { extractCollection } from '../utils/api';

const statusMap = {
  Created: {
    label: 'Utworzone',
    accent: '#9ca3af',
    background: '#f3f4f6',
    color: '#374151',
    icon: Clock,
  },
  Accepted: {
    label: 'Zaakceptowane',
    accent: '#60a5fa',
    background: '#dbeafe',
    color: '#1d4ed8',
    icon: Clock,
  },
  'In diagnostics': {
    label: 'W diagnozie',
    accent: '#fbbf24',
    background: '#fef3c7',
    color: '#b45309',
    icon: Clock,
  },
  'Waiting for parts': {
    label: 'Oczekuje na czesci',
    accent: '#fb923c',
    background: '#ffedd5',
    color: '#c2410c',
    icon: AlertTriangle,
  },
  'In service': {
    label: 'W serwisie',
    accent: '#a78bfa',
    background: '#ede9fe',
    color: '#6d28d9',
    icon: Package,
  },
  'Ready for collection': {
    label: 'Gotowe do odbioru',
    accent: '#34d399',
    background: '#d1fae5',
    color: '#047857',
    icon: CheckCircle,
  },
  Completed: {
    label: 'Zakonczone',
    accent: '#10b981',
    background: '#d1fae5',
    color: '#065f46',
    icon: CheckCircle,
  },
};

function getStatusInfo(status) {
  return (
    statusMap[status] || {
      label: status || 'Nieznany status',
      accent: '#d1d5db',
      background: '#f9fafb',
      color: '#374151',
      icon: Clock,
    }
  );
}

function formatDate(value, withTime = false) {
  if (!value) {
    return 'Brak danych';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Brak danych';
  }

  return withTime
    ? date.toLocaleString('pl-PL')
    : date.toLocaleDateString('pl-PL');
}

function PageFrame({ children }) {
  return (
    <div className="client-dashboard">
      <header className="hero-navbar" style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee', position: 'relative' }}>
        <div className="hero-navbar-inner container">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="RepairFlow logo" className="logo-image" style={{ height: '40px' }} />
            </Link>
          </div>
          <Link to="/" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ArrowLeft size={18} />
            Wroc do strony glownej
          </Link>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        {children}
      </main>
    </div>
  );
}

export default function ClientDashboard() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const accessCode = searchParams.get('code');
  const hasLookupParams = Boolean(orderNumber && accessCode);
  const { user, token, loading: authLoading } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!hasLookupParams && authLoading) {
        return;
      }

      setLoading(true);
      setError('');
      setOrderData(null);
      setOrders([]);

      try {
        if (hasLookupParams) {
          const response = await fetch(`/api/v1/user/single-order?order_number=${orderNumber}&access_code=${accessCode}`);
          if (!response.ok) {
            throw new Error('Nie znaleziono zlecenia lub kod dostepu jest nieprawidlowy.');
          }

          const data = await response.json();
          if (isMounted) {
            setOrderData(data);
          }
          return;
        }

        if (!user || !token) {
          throw new Error('Brak danych klienta. Zaloguj sie ponownie albo sprawdz zlecenie kodem dostepu.');
        }

        const response = await fetch('/api/v1/user/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Nie udalo sie pobrac listy zlecen klienta.');
        }

        const data = await response.json();
        if (isMounted) {
          setOrders(extractCollection(data));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Wystapil nieoczekiwany blad.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [accessCode, authLoading, hasLookupParams, orderNumber, token, user]);

  if (loading || (!hasLookupParams && authLoading)) {
    return (
      <PageFrame>
        <div className="dashboard-card" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          Ladowanie szczegolow zlecenia...
        </div>
      </PageFrame>
    );
  }

  if (error) {
    return (
      <PageFrame>
        <div className="dashboard-card" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginBottom: '12px' }}>Wystapil blad</h2>
          <p style={{ color: '#4b5563', marginBottom: '20px' }}>{error}</p>
          <Link to="/" className="btn btn-primary">Wroc na strone glowna</Link>
        </div>
      </PageFrame>
    );
  }

  if (hasLookupParams && orderData) {
    const statusInfo = getStatusInfo(orderData.status);
    const StatusIcon = statusInfo.icon;
    const history = Array.isArray(orderData.history) ? orderData.history : [];
    const isDelayed =
      orderData.estimated_completion_date &&
      new Date(orderData.estimated_completion_date) < new Date() &&
      orderData.status !== 'Completed' &&
      orderData.status !== 'Ready for collection';

    return (
      <PageFrame>
        <div className="dashboard-card" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Zlecenie: {orderData.order_number}</h1>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Model: <strong>{orderData.device_model}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', backgroundColor: statusInfo.background, color: statusInfo.color }}>
                <StatusIcon size={20} />
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {isDelayed && (
            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', gap: '16px' }}>
              <AlertTriangle color="#ef4444" size={24} />
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Informacja o opoznieniu</h4>
                <p style={{ margin: 0, color: '#b91c1c' }}>
                  Realizacja tego zlecenia trwa dluzej niz pierwotnie zakladano.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#333' }}>Szczegoly usterki</h3>
              <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
                <p style={{ lineHeight: '1.6', color: '#4b5563', margin: 0 }}>{orderData.issue_description}</p>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#333' }}>Harmonogram naprawy</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#6b7280' }}>Data przyjecia:</span>
                  <strong style={{ color: '#111827' }}>{formatDate(orderData.created_at)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ color: '#6b7280' }}>Szacowany termin zakonczenia:</span>
                  <strong style={{ color: '#111827' }}>{formatDate(orderData.estimated_completion_date)}</strong>
                </li>
              </ul>
            </div>
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#333' }}>Historia zlecenia</h3>
              <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', paddingLeft: '24px', marginLeft: '12px' }}>
                {history.map((hist, idx) => (
                  <div key={idx} style={{ marginBottom: '24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #ef3b2d' }}></div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>
                      {formatDate(hist.changed_at, true)}
                    </div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>
                      Zmiana statusu na: {getStatusInfo(hist.new_status).label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className="dashboard-card" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#111827' }}>Twoje zlecenia</h1>
            <p style={{ color: '#6b7280', lineHeight: '1.7', maxWidth: '58ch' }}>
              {user ? `${user.first_name || ''} ${user.last_name || ''}, tutaj widzisz wszystkie swoje naprawy po zalogowaniu.`.trim() : 'Tutaj znajdziesz historie swoich napraw.'}
            </p>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '18px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', minWidth: '220px' }}>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Konto klienta</div>
            <div style={{ fontWeight: '700', color: '#111827' }}>{user?.email || 'Brak adresu e-mail'}</div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: '18px', backgroundColor: '#f9fafb', color: '#4b5563' }}>
            Nie znaleziono zadnych zlecen przypisanych do tego konta.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <article
                  key={order.order_number}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '22px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Numer zlecenia</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>{order.order_number}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Sprzet</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{order.device_model}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Status</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', backgroundColor: statusInfo.background, color: statusInfo.color }}>
                      <StatusIcon size={18} />
                      <span style={{ fontWeight: '600' }}>{statusInfo.label}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Przyjeto</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{formatDate(order.created_at)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>Planowane zakonczenie</div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{formatDate(order.estimated_completion_date)}</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
