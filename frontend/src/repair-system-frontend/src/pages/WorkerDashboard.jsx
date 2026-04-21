import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Settings, LogOut, Package, Plus, Search, Edit } from 'lucide-react';
import logo from '../assets/logo.png';
import Modal from '../components/Modal';

const statusMap = {
  "Created": { label: "Utworzone", class: "bg-gray-100 text-gray-800" },
  "Accepted": { label: "Zaakceptowane", class: "bg-blue-100 text-blue-800" },
  "In diagnostics": { label: "W diagnozie", class: "bg-yellow-100 text-yellow-800" },
  "Waiting for parts": { label: "Oczekuje na części", class: "bg-orange-100 text-orange-800" },
  "In service": { label: "W serwisie", class: "bg-purple-100 text-purple-800" },
  "Ready for collection": { label: "Gotowe do odbioru", class: "bg-green-100 text-green-800" },
  "Completed": { label: "Zakończone", class: "bg-emerald-100 text-emerald-800" }
};

export default function WorkerDashboard() {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extra states for forms and modals
  const [usersList, setUsersList] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [clientForm, setClientForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [orderForm, setOrderForm] = useState({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
  const [newDeviceTypeForm, setNewDeviceTypeForm] = useState({ name: '' });
  const [showNewDeviceType, setShowNewDeviceType] = useState(false);

  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderStatus, setEditOrderStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchDeviceTypes();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/v1/repair-order/', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/worker/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data.items || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await fetch('/api/v1/device-type/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(data.items || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch device types:', error);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/worker/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientForm)
      });
      if (response.ok) {
        setIsClientModalOpen(false);
        setClientForm({ first_name: '', last_name: '', email: '', phone_number: '' });
        fetchUsers();
      } else {
        const errData = await response.json();
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Błąd podczas tworzenia klienta');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      let finalDeviceTypeId = orderForm.device_type_id;
      
      if (showNewDeviceType && newDeviceTypeForm.name) {
        const dtResponse = await fetch('/api/v1/device-type/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: newDeviceTypeForm.name })
        });
        if (dtResponse.ok) {
          const dtData = await dtResponse.json();
          finalDeviceTypeId = dtData.id;
          fetchDeviceTypes(); 
        }
      }

      if (!finalDeviceTypeId) {
        alert("Wybierz lub dodaj typ urządzenia!");
        return;
      }

      const response = await fetch('/api/v1/repair-order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          client_id: parseInt(orderForm.client_id),
          device_type_id: parseInt(finalDeviceTypeId),
          device_model: orderForm.device_model,
          issue_description: orderForm.issue_description
        })
      });
      if (response.ok) {
        setIsOrderModalOpen(false);
        setOrderForm({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
        setShowNewDeviceType(false);
        setNewDeviceTypeForm({ name: '' });
        fetchOrders();
      } else {
        const errData = await response.json();
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Błąd podczas tworzenia zlecenia');
    }
  };

  const handleEditOrderStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const response = await fetch(`/api/v1/repair-order/${editingOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: editOrderStatus })
      });
      if (response.ok) {
        setEditingOrder(null);
        fetchOrders();
      } else {
        const err = await response.json();
        alert(`Błąd: ${JSON.stringify(err)}`);
      }
    } catch (error) {
      console.error(error);
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
          {user?.role === 'Admin' && (
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
          <div style={{display: 'flex', gap: '12px'}}>
            <button onClick={() => setIsClientModalOpen(true)} className="btn btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 20px', backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer', fontWeight: '600'}}>
              <Plus size={18} />
              Dodaj klienta
            </button>
            <button onClick={() => setIsOrderModalOpen(true)} className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 20px'}}>
              <Plus size={18} />
              Nowe zlecenie
            </button>
          </div>
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
                        <button 
                          onClick={() => { setEditingOrder(order); setEditOrderStatus(order.status); }}
                          style={{background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
                        >
                          <Edit size={16} /> Zmień status
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

      {/* Modals */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Dodaj klienta">
        <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Imię</label>
            <input required type="text" value={clientForm.first_name} onChange={e => setClientForm({...clientForm, first_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nazwisko</label>
            <input required type="text" value={clientForm.last_name} onChange={e => setClientForm({...clientForm, last_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input required type="email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Telefon</label>
            <input required type="text" value={clientForm.phone_number} onChange={e => setClientForm({...clientForm, phone_number: e.target.value})} placeholder="+48 123 456 789" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsClientModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Zapisz</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Nowe zlecenie">
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Klient</label>
            <select required value={orderForm.client_id} onChange={e => setOrderForm({...orderForm, client_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="">Wybierz klienta...</option>
              {usersList.map(u => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Typ urządzenia</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!showNewDeviceType ? (
                <>
                  <select required value={orderForm.device_type_id} onChange={e => setOrderForm({...orderForm, device_type_id: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    <option value="">Wybierz typ...</option>
                    {deviceTypes.map(dt => (
                      <option key={dt.id} value={dt.id}>{dt.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { setShowNewDeviceType(true); setOrderForm({...orderForm, device_type_id: ''}); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer' }}>+</button>
                </>
              ) : (
                <>
                  <input required type="text" placeholder="Nazwa nowego typu..." value={newDeviceTypeForm.name} onChange={e => setNewDeviceTypeForm({name: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  <button type="button" onClick={() => setShowNewDeviceType(false)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer' }}>Wróć</button>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Model urządzenia</label>
            <input required type="text" value={orderForm.device_model} onChange={e => setOrderForm({...orderForm, device_model: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Opis usterki</label>
            <textarea required value={orderForm.issue_description} onChange={e => setOrderForm({...orderForm, issue_description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsOrderModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Zapisz zlecnie</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title="Edytuj status zlecenia">
        <form onSubmit={handleEditOrderStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Zmień status</label>
            <select required value={editOrderStatus} onChange={e => setEditOrderStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setEditingOrder(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Zapisz</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
