import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

const statusMap = {
  "PENDING": { label: "Oczekujące", color: "text-yellow-600", bg: "bg-yellow-100", icon: Clock },
  "IN_PROGRESS": { label: "W trakcie naprawy", color: "text-blue-600", bg: "bg-blue-100", icon: Clock },
  "COMPLETED": { label: "Zakończone", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle },
  "CANCELLED": { label: "Anulowane", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle },
  "READY_FOR_PICKUP": { label: "Gotowe do odbioru", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle }
};

export default function ClientDashboard() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const accessCode = searchParams.get('code');
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber || !accessCode) {
        setError('Brak wymaganych parametrów zlecenia.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/user/single-order?order_number=${orderNumber}&access_code=${accessCode}`);
        if (!response.ok) {
          throw new Error('Nie znaleziono zlecenia lub kod dostępu jest nieprawidłowy.');
        }
        const data = await response.json();
        setOrderData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, accessCode]);

  if (loading) {
    return <div className="client-dashboard-loading">Ładowanie szczegółów zlecenia...</div>;
  }

  if (error) {
    return (
      <div className="client-dashboard-error">
        <h2>Wystąpił błąd</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Wróć na stronę główną</Link>
      </div>
    );
  }

  if (!orderData) return null;

  const StatusIcon = statusMap[orderData.status]?.icon || Clock;
  const statusInfo = statusMap[orderData.status] || { label: orderData.status, color: "text-gray-600", bg: "bg-gray-100" };

  // Sprawdzanie opóźnień
  const isDelayed = orderData.estimated_completion_date && new Date(orderData.estimated_completion_date) < new Date() && orderData.status !== 'COMPLETED' && orderData.status !== 'READY_FOR_PICKUP';

  return (
    <div className="client-dashboard">
      <header className="hero-navbar" style={{backgroundColor: '#fff', borderBottom: '1px solid #eee', position: 'relative'}}>
        <div className="hero-navbar-inner container">
          <div className="logo">
            <Link to="/">
                <img src={logo} alt="RepairFlow logo" className="logo-image" style={{height: '40px'}} />
            </Link>
          </div>
          <Link to="/" className="btn btn-primary" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <ArrowLeft size={18} />
            Wróć do strony głównej
          </Link>
        </div>
      </header>

      <main className="container" style={{paddingTop: '60px', paddingBottom: '60px'}}>
        <div className="dashboard-card" style={{backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '30px'}}>
                <div>
                    <h1 style={{fontSize: '2rem', marginBottom: '8px'}}>Zlecenie: {orderData.order_number}</h1>
                    <p style={{color: '#666', fontSize: '1.1rem'}}>Model: <strong>{orderData.device_model}</strong></p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '999px', backgroundColor: 'rgba(0,0,0,0.05)'}}>
                        <StatusIcon size={20} />
                        <span style={{fontWeight: '600', fontSize: '1.1rem'}}>{statusInfo.label}</span>
                    </div>
                </div>
            </div>

            {isDelayed && (
                <div style={{backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', gap: '16px'}}>
                    <AlertTriangle color="#ef4444" size={24} />
                    <div>
                        <h4 style={{margin: '0 0 8px 0', color: '#991b1b'}}>Informacja o opóźnieniu</h4>
                        <p style={{margin: 0, color: '#b91c1c'}}>
                            Realizacja Twojego zlecenia potrwa nieco dłużej niż pierwotnie zakładano. Przepraszamy za niedogodności.
                        </p>
                    </div>
                </div>
            )}

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
                <div>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '16px', color: '#333'}}>Szczegóły usterki</h3>
                    <div style={{backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px'}}>
                        <p style={{lineHeight: '1.6', color: '#4b5563', margin: 0}}>{orderData.issue_description}</p>
                    </div>
                </div>

                <div>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '16px', color: '#333'}}>Harmonogram naprawy</h3>
                    <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <li style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee'}}>
                            <span style={{color: '#6b7280'}}>Data przyjęcia:</span>
                            <strong style={{color: '#111827'}}>{new Date(orderData.created_at).toLocaleDateString('pl-PL')}</strong>
                        </li>
                        <li style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #eee'}}>
                            <span style={{color: '#6b7280'}}>Szacowany termin zakończenia:</span>
                            <strong style={{color: '#111827'}}>{orderData.estimated_completion_date ? new Date(orderData.estimated_completion_date).toLocaleDateString('pl-PL') : 'Brak danych'}</strong>
                        </li>
                    </ul>
                </div>
            </div>
            
            {orderData.history && orderData.history.length > 0 && (
                <div style={{marginTop: '40px'}}>
                    <h3 style={{fontSize: '1.2rem', marginBottom: '24px', color: '#333'}}>Historia zlecenia</h3>
                    <div style={{position: 'relative', borderLeft: '2px solid #e5e7eb', paddingLeft: '24px', marginLeft: '12px'}}>
                        {orderData.history.map((hist, idx) => (
                            <div key={idx} style={{marginBottom: '24px', position: 'relative'}}>
                                <div style={{position: 'absolute', left: '-33px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #ef3b2d'}}></div>
                                <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px'}}>
                                    {new Date(hist.changed_at).toLocaleString('pl-PL')}
                                </div>
                                <div style={{fontWeight: '500', color: '#111827'}}>
                                    Zmiana statusu na: {statusMap[hist.new_status]?.label || hist.new_status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
