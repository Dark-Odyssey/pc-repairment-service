import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, House, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardFrame from '../components/DashboardFrame';
import { extractRepairOrders, normalizeRepairOrder } from '../utils/repairOrders';

const statusMap = {
  Created: {
    label: 'Utworzone',
    background: '#f3f4f6',
    color: '#374151',
    icon: Clock,
  },
  Accepted: {
    label: 'Zaakceptowane',
    background: '#dbeafe',
    color: '#1d4ed8',
    icon: Clock,
  },
  'In diagnostics': {
    label: 'W diagnozie',
    background: '#fef3c7',
    color: '#b45309',
    icon: Clock,
  },
  'Waiting for parts': {
    label: 'Oczekuje na części',
    background: '#ffedd5',
    color: '#c2410c',
    icon: AlertTriangle,
  },
  'In service': {
    label: 'W serwisie',
    background: '#ede9fe',
    color: '#6d28d9',
    icon: Package,
  },
  'Ready for collection': {
    label: 'Gotowe do odbioru',
    background: '#d1fae5',
    color: '#047857',
    icon: CheckCircle,
  },
  Completed: {
    label: 'Zakończone',
    background: '#d1fae5',
    color: '#065f46',
    icon: CheckCircle,
  },
};

function getStatusInfo(status) {
  return (
    statusMap[status] || {
      label: status || 'Nieznany status',
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

  return withTime ? date.toLocaleString('pl-PL') : date.toLocaleDateString('pl-PL');
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'Do ustalenia';
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return 'Do ustalenia';
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHistoryLines(entry) {
  const lines = [];

  if ((entry.old_status || '') !== (entry.new_status || '')) {
    lines.push(
      entry.old_status
        ? `Status: ${getStatusInfo(entry.old_status).label} -> ${getStatusInfo(entry.new_status).label}`
        : `Status ustawiono na: ${getStatusInfo(entry.new_status).label}`
    );
  }

  if ((entry.old_estimated_completion_date || '') !== (entry.new_estimated_completion_date || '')) {
    lines.push(
      entry.old_estimated_completion_date
        ? `Termin: ${formatDate(entry.old_estimated_completion_date)} -> ${formatDate(entry.new_estimated_completion_date)}`
        : `Ustawiono termin: ${formatDate(entry.new_estimated_completion_date)}`
    );
  }

  return lines.length > 0 ? lines : ['Zaktualizowano zlecenie'];
}

function OrderHistoryTimeline({ history, compact = false }) {
  const entries = Array.isArray(history) ? history : [];

  if (entries.length === 0) {
    return (
      <div style={{ padding: compact ? '14px 16px' : '18px 20px', borderRadius: '14px', backgroundColor: '#f9fafb', color: '#6b7280' }}>
        Brak zapisanej historii zmian.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', paddingLeft: compact ? '18px' : '24px', marginLeft: compact ? '6px' : '12px' }}>
      {entries.map((entry, index) => (
        <div key={`${entry.changed_at || index}-${index}`} style={{ marginBottom: compact ? '18px' : '24px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: compact ? '-27px' : '-33px',
              top: '4px',
              width: compact ? '14px' : '16px',
              height: compact ? '14px' : '16px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '2px solid #ef3b2d',
            }}
          />
          <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '6px' }}>{formatDate(entry.changed_at, true)}</div>
          {getHistoryLines(entry).map((line) => (
            <div key={line} style={{ fontWeight: compact ? '400' : '500', color: '#111827', lineHeight: '1.6' }}>
              {line}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PageFrame({ children, user, onLogout, lookupMode = false }) {
  const navItems = lookupMode || !user
    ? [
        { key: 'home', label: 'Strona główna', icon: House, to: '/' },
        { key: 'status', label: 'Status zlecenia', icon: Package, active: true },
      ]
    : [
        { key: 'home', label: 'Strona główna', icon: House, to: '/' },
        { key: 'orders', label: 'Moje zlecenia', icon: Package, active: true },
      ];

  return (
    <DashboardFrame
      badge={lookupMode || !user ? 'Status' : 'Klient'}
      badgeTone={lookupMode || !user ? 'status' : 'client'}
      subtitle={lookupMode || !user ? 'śledzenie naprawy online' : 'panel klienta'}
      navItems={navItems}
      user={lookupMode ? null : user}
      onLogout={lookupMode ? null : onLogout}
      headerTitle={lookupMode ? 'Status zlecenia' : 'Moje zlecenia'}
    >
      {children}
    </DashboardFrame>
  );
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const accessCode = searchParams.get('code');
  const hasLookupParams = Boolean(orderNumber && accessCode);
  const { user, loading: authLoading, authFetch, logout } = useAuth();

  const [orderData, setOrderData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
            throw new Error('Nie znaleziono zlecenia lub kod dostępu jest nieprawidłowy.');
          }

          const data = normalizeRepairOrder(await response.json());
          if (isMounted) {
            setOrderData(data);
          }
          return;
        }

        if (!user) {
          throw new Error('Brak danych klienta. Zaloguj się ponownie albo sprawdź zlecenie kodem dostępu.');
        }

        const response = await authFetch('/api/v1/user/orders');
        if (!response.ok) {
          throw new Error('Nie udało się pobrać listy zleceń klienta.');
        }

        const data = await response.json();
        if (isMounted) {
          setOrders(extractRepairOrders(data));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Wystąpił nieoczekiwany błąd.');
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
  }, [accessCode, authLoading, authFetch, hasLookupParams, orderNumber, user]);

  const activeOrdersCount = useMemo(
    () => orders.filter((order) => order.status !== 'Completed' && order.status !== 'Ready for collection').length,
    [orders]
  );

  const readyOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'Ready for collection' || order.status === 'Completed').length,
    [orders]
  );

  if (loading || (!hasLookupParams && authLoading)) {
    return (
      <PageFrame user={user} onLogout={handleLogout} lookupMode={hasLookupParams}>
        <div className="rf-dashboard-card">
          <div className="rf-dashboard-card-body">Ładowanie szczegółów zlecenia...</div>
        </div>
      </PageFrame>
    );
  }

  if (error) {
    return (
      <PageFrame user={user} onLogout={handleLogout} lookupMode={hasLookupParams}>
        <div className="rf-dashboard-card">
          <div className="rf-dashboard-card-body rf-dashboard-stack">
            <div>
              <h2 className="rf-dashboard-heading">Wystąpił błąd</h2>
              <p style={{ color: '#475569', lineHeight: '1.7' }}>{error}</p>
            </div>
            <div>
              <Link to="/" className="rf-dashboard-action rf-dashboard-action--primary">Wróć na stronę główną</Link>
            </div>
          </div>
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
      <PageFrame user={user} onLogout={handleLogout} lookupMode={hasLookupParams}>
        <div className="rf-dashboard-section">
          <div className="rf-dashboard-card">
            <div className="rf-dashboard-card-body rf-dashboard-stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '8px' }}>Numer zgłoszenia</div>
                  <h2 style={{ color: '#111827', fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{orderData.order_number}</h2>
                  <p style={{ color: '#475569', marginTop: '8px' }}>Sprzęt: <strong>{orderData.device_model || 'Brak danych'}</strong></p>
                </div>

                <div className="rf-dashboard-pill" style={{ backgroundColor: statusInfo.background, color: statusInfo.color, minHeight: '38px', padding: '0 16px', gap: '8px', display: 'inline-flex' }}>
                  <StatusIcon size={18} />
                  <span>{statusInfo.label}</span>
                </div>
              </div>

              <div className="rf-dashboard-statgrid">
                <div className="rf-dashboard-stat">
                  <label>Data przyjęcia</label>
                  <strong>{formatDate(orderData.created_at)}</strong>
                </div>
                <div className="rf-dashboard-stat">
                  <label>Planowane zakończenie</label>
                  <strong>{formatDate(orderData.estimated_completion_date)}</strong>
                </div>
                <div className="rf-dashboard-stat">
                  <label>Status naprawy</label>
                  <strong>{statusInfo.label}</strong>
                </div>
                <div className="rf-dashboard-stat">
                  <label>Cena</label>
                  <strong>{formatPrice(orderData.price)}</strong>
                </div>
              </div>
            </div>
          </div>

          {isDelayed ? (
            <div className="rf-dashboard-alert">
              <AlertTriangle color="#ef4444" size={22} />
              <div>
                <h4>Informacja o opóźnieniu</h4>
                <p>Realizacja tego zlecenia trwa dłużej niż pierwotnie zakładano.</p>
              </div>
            </div>
          ) : null}

          <div className="rf-dashboard-detail-grid">
            <div className="rf-dashboard-note">
              <h3>Szczegóły usterki</h3>
              <p>{orderData.issue_description || 'Brak opisu usterki.'}</p>
            </div>
            <div className="rf-dashboard-note">
              <h3>Harmonogram naprawy</h3>
              <p>Przyjęcie: {formatDate(orderData.created_at)}</p>
              <p style={{ marginTop: '10px' }}>Szacowany termin zakończenia: {formatDate(orderData.estimated_completion_date)}</p>
              <p style={{ marginTop: '10px' }}>Cena: {formatPrice(orderData.price)}</p>
            </div>
          </div>

          <div className="rf-dashboard-card">
            <div className="rf-dashboard-card-body">
              <div className="rf-dashboard-heading">Historia zlecenia</div>
              <OrderHistoryTimeline history={history} />
            </div>
          </div>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame user={user} onLogout={handleLogout} lookupMode={hasLookupParams}>
      <div className="rf-dashboard-section">
        <div className="rf-dashboard-statgrid">
          <div className="rf-dashboard-stat">
            <label>Wszystkie zlecenia</label>
            <strong>{orders.length}</strong>
          </div>
          <div className="rf-dashboard-stat">
            <label>Aktywne naprawy</label>
            <strong>{activeOrdersCount}</strong>
          </div>
          <div className="rf-dashboard-stat">
            <label>Gotowe lub zakończone</label>
            <strong>{readyOrdersCount}</strong>
          </div>
        </div>

        <div className="rf-dashboard-card">
          <div className="rf-dashboard-card-body rf-dashboard-stack">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
              <div>
                <h2 className="rf-dashboard-heading" style={{ marginBottom: '8px' }}>Twoje zlecenia</h2>
                <p style={{ color: '#475569', lineHeight: '1.7', maxWidth: '62ch' }}>
                  {user
                    ? `${user.first_name || ''} ${user.last_name || ''}, tutaj widzisz wszystkie swoje naprawy po zalogowaniu.`.trim()
                    : 'Tutaj znajdziesz historię swoich napraw.'}
                </p>
              </div>
              <div className="rf-dashboard-note" style={{ minWidth: '220px' }}>
                <h3>Konto klienta</h3>
                <p>{user?.email || 'Brak adresu e-mail'}</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="rf-dashboard-empty" style={{ backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e5ebf2' }}>
                Nie znaleziono żadnych zleceń przypisanych do tego konta.
              </div>
            ) : (
              <div className="rf-dashboard-order-grid">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  const history = Array.isArray(order.history) ? order.history : [];

                  return (
                    <article key={order.id || order.order_number} className="rf-dashboard-note">
                      <div className="rf-dashboard-detail-grid">
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Numer zlecenia</div>
                          <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>{order.order_number}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Sprzęt</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{order.device_model || 'Brak danych'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Status</div>
                          <div className="rf-dashboard-pill" style={{ backgroundColor: statusInfo.background, color: statusInfo.color, display: 'inline-flex', gap: '8px' }}>
                            <StatusIcon size={16} />
                            <span>{statusInfo.label}</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Przyjęto</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{formatDate(order.created_at)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Planowane zakończenie</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{formatDate(order.estimated_completion_date)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>Cena</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{formatPrice(order.price)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid #e5ebf2' }}>
                        <div className="rf-dashboard-heading" style={{ marginBottom: '12px' }}>Historia zmian</div>
                        <OrderHistoryTimeline history={history} compact />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
