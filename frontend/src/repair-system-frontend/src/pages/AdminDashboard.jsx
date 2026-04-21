import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Edit, Trash2, LogOut, Package } from 'lucide-react';
import logo from '../assets/logo.png';
import Modal from '../components/Modal';
import { extractCollection } from '../utils/api';

const statusMap = {
  Created: { label: 'Utworzone', class: 'bg-gray-100 text-gray-800' },
  Accepted: { label: 'Zaakceptowane', class: 'bg-blue-100 text-blue-800' },
  'In diagnostics': { label: 'W diagnozie', class: 'bg-yellow-100 text-yellow-800' },
  'Waiting for parts': { label: 'Oczekuje na czesci', class: 'bg-orange-100 text-orange-800' },
  'In service': { label: 'W serwisie', class: 'bg-purple-100 text-purple-800' },
  'Ready for collection': { label: 'Gotowe do odbioru', class: 'bg-green-100 text-green-800' },
  Completed: { label: 'Zakonczone', class: 'bg-emerald-100 text-emerald-800' },
};

const emptyEditOrderForm = {
  status: 'Created',
  estimated_completion_date: '',
  service_note: '',
};

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

function toDateInputValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function getStatusLabel(status) {
  return statusMap[status]?.label || status || 'Brak statusu';
}

function getHistoryLines(entry) {
  const lines = [];

  if ((entry.old_status || '') !== (entry.new_status || '')) {
    lines.push(
      entry.old_status
        ? `Status: ${getStatusLabel(entry.old_status)} -> ${getStatusLabel(entry.new_status)}`
        : `Status ustawiono na: ${getStatusLabel(entry.new_status)}`
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

export default function AdminDashboard() {
  const { user, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', role: 'Worker' });
  const [orderForm, setOrderForm] = useState({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
  const [newDeviceTypeForm, setNewDeviceTypeForm] = useState({ device_type: '', description: '' });
  const [showNewDeviceType, setShowNewDeviceType] = useState(false);

  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState(emptyEditOrderForm);
  const [editOrderLoading, setEditOrderLoading] = useState(false);

  useEffect(() => {
    fetchDeviceTypes();
    fetchUsers();

    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/api/v1/repair-order/');
      if (response.ok) {
        const data = await response.json();
        setOrders(extractCollection(data));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authFetch('/api/v1/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsersList(extractCollection(data));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const response = await authFetch('/api/v1/device-type/');
      if (response.ok) {
        const data = await response.json();
        setDeviceTypes(extractCollection(data));
      }
    } catch (error) {
      console.error('Failed to fetch device types:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch('/api/v1/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });
      if (response.ok) {
        setIsUserModalOpen(false);
        setUserForm({ first_name: '', last_name: '', email: '', phone_number: '', role: 'Worker' });
        fetchUsers();
      } else {
        const errData = await response.json();
        alert(`Blad: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Blad podczas tworzenia uzytkownika');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      let finalDeviceTypeId = orderForm.device_type_id;

      if (showNewDeviceType && newDeviceTypeForm.device_type) {
        const dtResponse = await authFetch('/api/v1/device-type/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newDeviceTypeForm),
        });
        if (dtResponse.ok) {
          const dtData = await dtResponse.json();
          finalDeviceTypeId = dtData.id;
          fetchDeviceTypes();
        } else {
          const errData = await dtResponse.json();
          alert(`Blad typu urzadzenia: ${JSON.stringify(errData)}`);
          return;
        }
      }

      if (!finalDeviceTypeId) {
        alert('Wybierz lub dodaj typ urzadzenia!');
        return;
      }

      const response = await authFetch('/api/v1/repair-order/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: parseInt(orderForm.client_id, 10),
          device_type_id: parseInt(finalDeviceTypeId, 10),
          device_model: orderForm.device_model,
          issue_description: orderForm.issue_description,
        }),
      });

      if (response.ok) {
        setIsOrderModalOpen(false);
        setOrderForm({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
        setShowNewDeviceType(false);
        setNewDeviceTypeForm({ device_type: '', description: '' });
        fetchOrders();
      } else {
        const errData = await response.json();
        alert(`Blad: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Blad podczas tworzenia zlecenia');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunac to zlecenie?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/v1/repair-order/${id}`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) {
        fetchOrders();
      } else {
        alert('Blad podczas usuwania');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditOrderModal = async (order) => {
    setEditingOrder(order);
    setEditOrderForm({
      status: order.status || 'Created',
      estimated_completion_date: toDateInputValue(order.estimated_completion_date),
      service_note: order.service_note || '',
    });
    setEditOrderLoading(true);

    try {
      const response = await authFetch(`/api/v1/repair-order/${order.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setEditingOrder(data);
      setEditOrderForm({
        status: data.status || 'Created',
        estimated_completion_date: toDateInputValue(data.estimated_completion_date),
        service_note: data.service_note || '',
      });
    } catch (error) {
      console.error('Failed to load order details:', error);
      alert('Nie udalo sie pobrac historii tego zlecenia.');
    } finally {
      setEditOrderLoading(false);
    }
  };

  const closeEditOrderModal = () => {
    setEditingOrder(null);
    setEditOrderForm(emptyEditOrderForm);
    setEditOrderLoading(false);
  };

  const handleEditOrderSubmit = async (e) => {
    e.preventDefault();
    if (!editingOrder) {
      return;
    }

    try {
      const payload = {
        status: editOrderForm.status,
        service_note: editOrderForm.service_note,
      };

      if (editOrderForm.estimated_completion_date) {
        payload.estimated_completion_date = editOrderForm.estimated_completion_date;
      }

      const response = await authFetch(`/api/v1/repair-order/${editingOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        closeEditOrderModal();
        fetchOrders();
      } else {
        const err = await response.json();
        alert(`Blad: ${JSON.stringify(err)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Nie udalo sie zapisac zmian zlecenia.');
    }
  };

  const clientOptions = usersList.filter((u) => u.role === 'User');
  const history = Array.isArray(editingOrder?.history) ? editingOrder.history : [];

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <aside style={{ width: '260px', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#fff' }}>RepairFlow Admin</span>
        </div>

        <nav style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'orders' ? '#1f2937' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#9ca3af', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Package size={20} />
            Wszystkie zlecenia
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: activeTab === 'users' ? '#1f2937' : 'transparent', color: activeTab === 'users' ? '#fff' : '#9ca3af', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <Users size={20} />
            Konta pracownikow
          </button>
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid #1f2937' }}>
          <div style={{ marginBottom: '16px', px: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{user?.email}</div>
          </div>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', borderRadius: '12px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            Wyloguj sie
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            {activeTab === 'orders' ? 'Zarzadzanie wszystkimi zleceniami' : 'Zarzadzanie kontami uzytkownikow'}
          </h1>
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 20px', backgroundColor: '#111827', borderColor: '#111827' }}
            onClick={() => activeTab === 'orders' ? setIsOrderModalOpen(true) : setIsUserModalOpen(true)}
          >
            <Plus size={18} />
            {activeTab === 'orders' ? 'Nowe zlecenie' : 'Dodaj pracownika'}
          </button>
        </header>

        <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder={activeTab === 'orders' ? 'Szukaj zlecenia...' : 'Szukaj pracownika...'}
                  style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>
            </div>

            {activeTab === 'orders' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Nr zlecenia</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Klient</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Sprzet</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Termin</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Ladowanie zlecen...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Brak zlecen w systemie.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>{order.order_number}</td>
                        <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                          {order.client ? `${order.client.first_name} ${order.client.last_name}` : 'Brak klienta'}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#4b5563' }}>{order.device_model}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', ...(statusMap[order.status] ? {} : { backgroundColor: '#f3f4f6', color: '#4b5563' }) }} className={statusMap[order.status]?.class || ''}>
                            {statusMap[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#6b7280' }}>{formatDate(order.estimated_completion_date)}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button
                            onClick={() => openEditOrderModal(order)}
                            style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Edit size={16} /> Szczegoly
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}
                          >
                            <Trash2 size={16} /> Usun
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Imie i nazwisko</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Rola</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', color: '#4b5563', fontSize: '0.9rem', textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Brak innych uzytkownikow.</td></tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>{u.first_name} {u.last_name}</td>
                        <td style={{ padding: '16px 24px', color: '#4b5563' }}>{u.email}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: u.role === 'Admin' ? '#fce7f3' : '#e0e7ff', color: u.role === 'Admin' ? '#be185d' : '#4338ca' }}>
                            {u.role === 'Admin' ? 'Administrator' : u.role === 'Worker' ? 'Pracownik' : 'Klient'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {u.is_active ? <span style={{ color: '#059669', fontSize: '0.9rem' }}>Aktywny</span> : <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>Zablokowany</span>}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <button style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Dodaj uzytkownika">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Imie</label>
            <input required type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nazwisko</label>
            <input required type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Telefon</label>
            <input required type="text" value={userForm.phone_number} onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })} placeholder="+48 123 456 789" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rola</label>
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
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
            <select required value={orderForm.client_id} onChange={(e) => setOrderForm({ ...orderForm, client_id: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="">Wybierz klienta...</option>
              {clientOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Typ urzadzenia</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!showNewDeviceType ? (
                <>
                  <select required value={orderForm.device_type_id} onChange={(e) => setOrderForm({ ...orderForm, device_type_id: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                    <option value="">Wybierz typ...</option>
                    {deviceTypes.map((dt) => (
                      <option key={dt.id} value={dt.id}>{dt.device_type}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { setShowNewDeviceType(true); setOrderForm({ ...orderForm, device_type_id: '' }); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer' }}>+</button>
                </>
              ) : (
                <>
                  <input required type="text" placeholder="Nazwa nowego typu..." value={newDeviceTypeForm.device_type} onChange={(e) => setNewDeviceTypeForm({ ...newDeviceTypeForm, device_type: e.target.value })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  <button type="button" onClick={() => { setShowNewDeviceType(false); setNewDeviceTypeForm({ device_type: '', description: '' }); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer' }}>Wroc</button>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Model urzadzenia</label>
            <input required type="text" value={orderForm.device_model} onChange={(e) => setOrderForm({ ...orderForm, device_model: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Opis usterki</label>
            <textarea required value={orderForm.issue_description} onChange={(e) => setOrderForm({ ...orderForm, issue_description: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={() => setIsOrderModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Zapisz zlecenie</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingOrder} onClose={closeEditOrderModal} title="Historia i edycja zlecenia" maxWidth="760px">
        <form onSubmit={handleEditOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px' }}>Numer zlecenia</div>
              <div style={{ fontWeight: '700', color: '#111827' }}>{editingOrder?.order_number || '-'}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px' }}>Przyjeto</div>
              <div style={{ fontWeight: '700', color: '#111827' }}>{formatDate(editingOrder?.created_at)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status</label>
              <select required value={editOrderForm.status} onChange={(e) => setEditOrderForm({ ...editOrderForm, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                {Object.entries(statusMap).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Estimated date</label>
              <input type="date" value={editOrderForm.estimated_completion_date} onChange={(e) => setEditOrderForm({ ...editOrderForm, estimated_completion_date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notatka serwisowa</label>
            <textarea value={editOrderForm.service_note} onChange={(e) => setEditOrderForm({ ...editOrderForm, service_note: e.target.value })} rows="4" placeholder="Dodaj notatke dla zlecenia..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <div style={{ fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Historia zmian</div>
            {editOrderLoading ? (
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', color: '#6b7280' }}>Ladowanie historii...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f9fafb', color: '#6b7280' }}>Brak zapisanej historii dla tego zlecenia.</div>
            ) : (
              <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', paddingLeft: '20px', marginLeft: '8px' }}>
                {history.map((entry, index) => (
                  <div key={`${entry.id || index}-${entry.changed_at || index}`} style={{ position: 'relative', marginBottom: '18px' }}>
                    <div style={{ position: 'absolute', left: '-29px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #ef3b2d' }} />
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '6px' }}>{formatDate(entry.changed_at, true)}</div>
                    {getHistoryLines(entry).map((line) => (
                      <div key={line} style={{ color: '#111827', lineHeight: '1.6' }}>{line}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={closeEditOrderModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Anuluj</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Zapisz zmiany</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
