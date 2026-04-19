import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Package, Plus, Search, Edit } from 'lucide-react';
import logo from '../assets/logo.png';

const statusMap = {
  "PENDING": { label: "Oczekujące", class: "bg-yellow-100 text-yellow-800" },
  "IN_PROGRESS": { label: "W trakcie", class: "bg-blue-100 text-blue-800" },
  "COMPLETED": { label: "Zakończone", class: "bg-green-100 text-green-800" },
  "CANCELLED": { label: "Anulowane", class: "bg-red-100 text-red-800" },
  "READY_FOR_PICKUP": { label: "Gotowe do odbioru", class: "bg-green-100 text-green-800" }
};

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/v1/repair-order/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // data.items might be the array if pagination is used
        setOrders(data.items || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6'}}>
      {/* Sidebar */}
      <aside style={{width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src={logo} alt="Logo" style={{height: '32px'}} />
          <span style={{fontWeight: '700', fontSize: '1.2rem', color: '#111827'}}>RepairFlow</span>
        </div>
        
        <nav style={{padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <Link to="/dashboard/worker" style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'rgba(239, 59, 45, 0.1)', color: 'var(--red)', borderRadius: '12px', fontWeight: '600'}}>
            <Package size={20} />
            Zlecenia
          </Link>
          {user?.role === 'admin' && (
            <Link to="/dashboard/admin" style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#4b5563', borderRadius: '12px', fontWeight: '500'}}>
              <Settings size={20} />
              Panel Admina
            </Link>
          )}
        </nav>

        <div style={{padding: '24px 16px', borderTop: '1px solid #e5e7eb'}}>
          <div style={{marginBottom: '16px', px: '16px'}}>
            <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#111827'}}>{user?.first_name} {user?.last_name}</div>
            <div style={{fontSize: '0.8rem', color: '#6b7280'}}>{user?.email}</div>
          </div>
          <button onClick={logout} style={{width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', borderRadius: '12px', fontWeight: '500', cursor: 'pointer', textAlign: 'left'}}>
            <LogOut size={20} />
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <header style={{backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0}}>Zarządzanie zleceniami</h1>
          <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 20px'}}>
            <Plus size={18} />
            Nowe zlecenie
          </button>
        </header>

        <div style={{padding: '40px', flex: 1, overflowY: 'auto'}}>
          <div style={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
            
            <div style={{padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{position: 'relative', width: '300px'}}>
                <Search size={18} style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af'}} />
                <input 
                  type="text" 
                  placeholder="Szukaj zlecenia..." 
                  style={{width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none'}}
                />
              </div>
            </div>

            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                  <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Nr Zlecenia</th>
                  <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Sprzęt</th>
                  <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Status</th>
                  <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Data przyjęcia</th>
                  <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right'}}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>Ładowanie zleceń...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="5" style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>Brak zleceń w systemie.</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} style={{borderBottom: '1px solid #e5e7eb'}}>
                      <td style={{padding: '16px 24px', fontWeight: '500', color: '#111827'}}>{order.order_number}</td>
                      <td style={{padding: '16px 24px', color: '#4b5563'}}>{order.device_model}</td>
                      <td style={{padding: '16px 24px'}}>
                        <span style={{padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', ...(statusMap[order.status] ? {} : {backgroundColor: '#f3f4f6', color: '#4b5563'})}} className={statusMap[order.status]?.class || ''}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td style={{padding: '16px 24px', color: '#6b7280'}}>{new Date(order.created_at).toLocaleDateString('pl-PL')}</td>
                      <td style={{padding: '16px 24px', textAlign: 'right'}}>
                        <button style={{background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                          <Edit size={16} /> Edytuj
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
