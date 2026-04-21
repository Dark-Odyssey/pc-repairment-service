import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
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

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // orders, users
  
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Forms State
  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', role: 'Worker' });
  const [orderForm, setOrderForm] = useState({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
  const [newDeviceTypeForm, setNewDeviceTypeForm] = useState({ name: '' });
  const [showNewDeviceType, setShowNewDeviceType] = useState(false);

  // Edit States
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderStatus, setEditOrderStatus] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
        fetchOrders();
    } else {
        fetchUsers();
    }
    fetchDeviceTypes();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/repair-order/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data.items || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });
      if (response.ok) {
        setIsUserModalOpen(false);
        setUserForm({ first_name: '', last_name: '', email: '', phone_number: '', role: 'Worker' });
        fetchUsers();
      } else {
        const errData = await response.json();
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Błąd podczas tworzenia użytkownika');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      let finalDeviceTypeId = orderForm.device_type_id;
      
      // If creating a new device type on the fly
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
          fetchDeviceTypes(); // refresh list
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

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zlecenie?")) return;
    try {
      const response = await fetch(`/api/v1/repair-order/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok || response.status === 204) {
        fetchOrders();
      } else {
        alert("Błąd podczas usuwania");
      }
    } catch (error) {
      console.error(error);
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
      <aside style={{width: '260px', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '24px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <img src={logo} alt="Logo" style={{height: '32px', filter: 'brightness(0) invert(1)'}} />
          <span style={{fontWeight: '700', fontSize: '1.2rem', color: '#fff'}}>RepairFlow Admin</span>
        </div>
        
        <nav style={{padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'orders' ? '#1f2937' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#9ca3af', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%'}}>
            <Package size={20} />
            Wszystkie zlecenia
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'users' ? '#1f2937' : 'transparent', color: activeTab === 'users' ? '#fff' : '#9ca3af', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%'}}>
            <Users size={20} />
            Konta pracowników
          </button>
        </nav>

        <div style={{padding: '24px 16px', borderTop: '1px solid #1f2937'}}>
          <div style={{marginBottom: '16px', px: '16px'}}>
            <div style={{fontSize: '0.9rem', fontWeight: '600', color: '#fff'}}>{user?.first_name} {user?.last_name}</div>
            <div style={{fontSize: '0.8rem', color: '#9ca3af'}}>{user?.email}</div>
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
          <h1 style={{fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0}}>
            {activeTab === 'orders' ? 'Zarządzanie wszystkimi zleceniami' : 'Zarządzanie kontami użytkowników'}
          </h1>
          <button 
            className="btn btn-primary" 
            style={{display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 20px', backgroundColor: '#111827', borderColor: '#111827'}}
            onClick={() => activeTab === 'orders' ? setIsOrderModalOpen(true) : setIsUserModalOpen(true)}
          >
            <Plus size={18} />
            {activeTab === 'orders' ? 'Nowe zlecenie' : 'Dodaj pracownika'}
          </button>
        </header>

        <div style={{padding: '40px', flex: 1, overflowY: 'auto'}}>
          <div style={{backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
            
            <div style={{padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{position: 'relative', width: '300px'}}>
                <Search size={18} style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af'}} />
                <input 
                  type="text" 
                  placeholder={activeTab === 'orders' ? "Szukaj zlecenia..." : "Szukaj pracownika..."} 
                  style={{width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none'}}
                />
              </div>
            </div>

            {activeTab === 'orders' ? (
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
                              <Edit size={16} /> Status
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '8px'}}
                            >
                              <Trash2 size={16} /> Usuń
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
            ) : (
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
                      <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Imię i Nazwisko</th>
                      <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Email</th>
                      <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Rola</th>
                      <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem'}}>Status</th>
                      <th style={{padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right'}}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>Ładowanie użytkowników...</td></tr>
                    ) : usersList.length === 0 ? (
                      <tr><td colSpan="5" style={{padding: '24px', textAlign: 'center', color: '#6b7280'}}>Brak innych użytkowników.</td></tr>
                    ) : (
                      usersList.map(u => (
                        <tr key={u.id} style={{borderBottom: '1px solid #e5e7eb'}}>
                          <td style={{padding: '16px 24px', fontWeight: '500', color: '#111827'}}>{u.first_name} {u.last_name}</td>
                          <td style={{padding: '16px 24px', color: '#4b5563'}}>{u.email}</td>
                          <td style={{padding: '16px 24px'}}>
                            <span style={{padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: u.role === 'Admin' ? '#fce7f3' : '#e0e7ff', color: u.role === 'Admin' ? '#be185d' : '#4338ca'}}>
                                {u.role === 'Admin' ? 'Administrator' : 'Pracownik'}
                            </span>
                          </td>
                          <td style={{padding: '16px 24px'}}>
                            {u.is_active ? 
                                <span style={{color: '#059669', fontSize: '0.9rem'}}>Aktywny</span> : 
                                <span style={{color: '#dc2626', fontSize: '0.9rem'}}>Zablokowany</span>
                            }
                          </td>
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
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Dodaj użytkownika">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Imię</label>
            <input required type="text" value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nazwisko</label>
            <input required type="text" value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Telefon</label>
            <input required type="text" value={userForm.phone_number} onChange={e => setUserForm({...userForm, phone_number: e.target.value})} placeholder="+48 123 456 789" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rola</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="Worker">Pracownik</option>
              <option value="Admin">Administrator</option>
              <option value="User">Klient</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsUserModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
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
