import { useEffect, useMemo, useState } from 'react';
import { House, Package, Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardFrame from '../components/DashboardFrame';
import Modal from '../components/Modal';
import { extractApiErrorMessage, extractCollection } from '../utils/api';
import { extractRepairOrders, normalizeRepairOrder } from '../utils/repairOrders';
import { sortCollection, toggleSortConfig } from '../utils/sorting';

const statusMap = {
  Created: { label: 'Utworzone', background: '#f3f4f6', color: '#374151' },
  Accepted: { label: 'Zaakceptowane', background: '#dbeafe', color: '#1d4ed8' },
  'In diagnostics': { label: 'W diagnozie', background: '#fef3c7', color: '#b45309' },
  'Waiting for parts': { label: 'Oczekuje na części', background: '#ffedd5', color: '#c2410c' },
  'In service': { label: 'W serwisie', background: '#ede9fe', color: '#6d28d9' },
  'Ready for collection': { label: 'Gotowe do odbioru', background: '#d1fae5', color: '#047857' },
  Completed: { label: 'Zakończone', background: '#d1fae5', color: '#065f46' },
};

const emptyEditOrderForm = {
  status: 'Created',
  estimated_completion_date: '',
  service_note: '',
};

const emptyEditUserForm = {
  first_name: '',
  last_name: '',
  role: 'Worker',
  is_active: true,
};

const fieldStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
};

const readOnlyStyle = {
  ...fieldStyle,
  borderColor: '#e5e7eb',
  backgroundColor: '#f9fafb',
  color: '#6b7280',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#111827',
};

const detailCardStyle = {
  padding: '16px',
  borderRadius: '14px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e5ebf2',
};

const secondaryButtonStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: '600',
};

const primaryButtonStyle = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: 'none',
  background: '#121b2d',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '700',
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

function getStatusStyle(status) {
  return (
    statusMap[status] || {
      label: status || 'Brak statusu',
      background: '#f3f4f6',
      color: '#475569',
    }
  );
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

function getPersonDisplayName(person) {
  if (!person) {
    return 'Brak danych';
  }

  const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim();
  return fullName || person.email || 'Brak danych';
}

function getRoleLabel(role) {
  if (role === 'Admin') {
    return 'Administrator';
  }

  if (role === 'Worker') {
    return 'Pracownik';
  }

  if (role === 'User') {
    return 'Klient';
  }

  return role || 'Brak danych';
}

function getUserStatusMeta(listedUser) {
  if (listedUser?.is_active) {
    return {
      label: 'Aktywny',
      color: '#059669',
    };
  }

  const createdAt = listedUser?.created_at ? new Date(listedUser.created_at).getTime() : null;
  const updatedAt = listedUser?.updated_at ? new Date(listedUser.updated_at).getTime() : null;
  const isUnconfirmed =
    createdAt !== null &&
    updatedAt !== null &&
    !Number.isNaN(createdAt) &&
    !Number.isNaN(updatedAt) &&
    createdAt === updatedAt;

  if (isUnconfirmed) {
    return {
      label: 'Nie potwierdzony',
      color: '#d97706',
    };
  }

  return {
    label: 'Zablokowany',
    color: '#dc2626',
  };
}

function getOrderSortValue(order, key) {
  switch (key) {
    case 'order_number':
      return order.order_number || '';
    case 'client':
      return order.client ? `${order.client.first_name || ''} ${order.client.last_name || ''}`.trim() : '';
    case 'device_model':
      return order.device_model || '';
    case 'status':
      return getStatusLabel(order.status);
    case 'worker_created':
      return getPersonDisplayName(order.worker_created);
    case 'worker_updated':
      return getPersonDisplayName(order.worker_updated);
    case 'estimated_completion_date':
      return order.estimated_completion_date ? new Date(order.estimated_completion_date).getTime() : null;
    default:
      return '';
  }
}

function getUserSortValue(listedUser, key) {
  switch (key) {
    case 'full_name':
      return `${listedUser.first_name || ''} ${listedUser.last_name || ''}`.trim();
    case 'email':
      return listedUser.email || '';
    case 'role':
      return getRoleLabel(listedUser.role);
    case 'status':
      return getUserStatusMeta(listedUser).label;
    default:
      return '';
  }
}

export default function AdminDashboard() {
  const { user, logout, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', role: 'Worker' });
  const [orderForm, setOrderForm] = useState({ client_id: '', device_type_id: '', device_model: '', issue_description: '' });
  const [newDeviceTypeForm, setNewDeviceTypeForm] = useState({ device_type: '', description: '' });
  const [showNewDeviceType, setShowNewDeviceType] = useState(false);

  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState(emptyEditOrderForm);
  const [editOrderLoading, setEditOrderLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState(emptyEditUserForm);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [orderSort, setOrderSort] = useState({ key: null, direction: 'asc' });
  const [userSort, setUserSort] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    setSearchQuery('');
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
        setOrders(extractRepairOrders(data));
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
    if (isCreatingUser) {
      return;
    }

    setIsCreatingUser(true);
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
        alert(extractApiErrorMessage(errData, 'Nie udało się utworzyć użytkownika.'));
      }
    } catch (error) {
      console.error(error);
      alert('Błąd podczas tworzenia użytkownika');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      let finalDeviceTypeId = orderForm.device_type_id;

      if (showNewDeviceType && newDeviceTypeForm.device_type) {
        const typedName = newDeviceTypeForm.device_type.trim().toLowerCase();
        const existingType = deviceTypes.find(dt => dt.device_type.toLowerCase() === typedName);

        if (existingType) {
          finalDeviceTypeId = existingType.id;
        } else {
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
            alert(`Błąd typu urządzenia: ${JSON.stringify(errData)}`);
            return;
          }
        }
      }

      if (!finalDeviceTypeId) {
        alert('Wybierz lub dodaj typ urządzenia.');
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
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Błąd podczas tworzenia zlecenia');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zlecenie?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/v1/repair-order/${id}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 204) {
        fetchOrders();
      } else {
        alert('Błąd podczas usuwania zlecenia.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditOrderModal = async (order) => {
    setEditingOrder(normalizeRepairOrder(order));
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

      const data = normalizeRepairOrder(await response.json());
      setEditingOrder(data);
      setEditOrderForm({
        status: data.status || 'Created',
        estimated_completion_date: toDateInputValue(data.estimated_completion_date),
        service_note: data.service_note || '',
      });
    } catch (error) {
      console.error('Failed to load order details:', error);
      alert('Nie udało się pobrać historii tego zlecenia.');
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
        const errData = await response.json();
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Nie udało się zapisać zmian zlecenia.');
    }
  };

  const openEditUserModal = (selectedUser) => {
    setEditingUser(selectedUser);
    setEditUserForm({
      first_name: selectedUser.first_name || '',
      last_name: selectedUser.last_name || '',
      role: selectedUser.role || 'Worker',
      is_active: Boolean(selectedUser.is_active),
    });
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setEditUserForm(emptyEditUserForm);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) {
      return;
    }

    try {
      const response = await authFetch(`/api/v1/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserForm),
      });

      if (response.ok) {
        closeEditUserModal();
        fetchUsers();
      } else {
        const errData = await response.json();
        alert(`Błąd: ${JSON.stringify(errData)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Nie udało się zapisać zmian użytkownika.');
    }
  };

  const handleDeleteUser = async (selectedUser) => {
    if (!selectedUser || deletingUserId) {
      return;
    }

    const displayName = `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.email;
    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${displayName}?`)) {
      return;
    }

    setDeletingUserId(selectedUser.id);
    try {
      const response = await authFetch(`/api/v1/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 204) {
        if (editingUser?.id === selectedUser.id) {
          closeEditUserModal();
        }
        fetchUsers();
      } else {
        const errData = await response.json().catch(() => null);
        alert(`Błąd usuwania użytkownika${errData ? `: ${JSON.stringify(errData)}` : '.'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Nie udało się usunąć użytkownika.');
    } finally {
      setDeletingUserId(null);
    }
  };

  const clientOptions = useMemo(() => usersList.filter((listedUser) => listedUser.role === 'User'), [usersList]);
  const staffUsers = useMemo(() => usersList.filter((listedUser) => listedUser.role !== 'User'), [usersList]);
  const history = Array.isArray(editingOrder?.history) ? editingOrder.history : [];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) => {
      const clientName = order.client ? `${order.client.first_name || ''} ${order.client.last_name || ''}`.trim() : '';
      return [order.order_number, order.device_model, clientName, getStatusLabel(order.status)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery, orders]);

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return staffUsers;
    }

    return staffUsers.filter((listedUser) =>
      [`${listedUser.first_name || ''} ${listedUser.last_name || ''}`.trim(), listedUser.email, listedUser.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, staffUsers]);

  const sortedOrders = useMemo(
    () => sortCollection(filteredOrders, orderSort, getOrderSortValue),
    [filteredOrders, orderSort]
  );

  const sortedUsers = useMemo(
    () => sortCollection(filteredUsers, userSort, getUserSortValue),
    [filteredUsers, userSort]
  );

  const renderSortableHeader = (label, key, sortConfig, setSortConfig, defaultDirection = 'asc') => {
    const isActive = sortConfig.key === key;
    const icon = !isActive ? '↕' : sortConfig.direction === 'asc' ? '↑' : '↓';

    return (
      <th aria-sort={isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button
          type="button"
          className={`rf-dashboard-sort-button${isActive ? ' rf-dashboard-sort-button--active' : ''}`}
          onClick={() => setSortConfig((currentSort) => toggleSortConfig(currentSort, key, defaultDirection))}
        >
          <span>{label}</span>
          <span className="rf-dashboard-sort-icon" aria-hidden="true">{icon}</span>
        </button>
      </th>
    );
  };

  const navItems = [
    { key: 'home', label: 'Strona główna', icon: House, to: '/' },
    { key: 'orders', label: 'Wszystkie zlecenia', icon: Package, active: activeTab === 'orders', onClick: () => setActiveTab('orders') },
    { key: 'users', label: 'Konta pracowników', icon: Users, active: activeTab === 'users', onClick: () => setActiveTab('users') },
  ];

  const headerTitle = activeTab === 'orders' ? 'Zarządzanie wszystkimi zleceniami' : 'Zarządzanie kontami pracowników';

  const headerActions = (
    <button
      type="button"
      className="rf-dashboard-action rf-dashboard-action--primary"
      onClick={() => (activeTab === 'orders' ? setIsOrderModalOpen(true) : setIsUserModalOpen(true))}
    >
      <Plus size={18} />
      <span>{activeTab === 'orders' ? 'Nowe zlecenie' : 'Dodaj pracownika'}</span>
    </button>
  );

  return (
    <>
      <DashboardFrame
        badge="Admin"
        badgeTone="admin"
        subtitle="centrum zarządzania serwisem"
        navItems={navItems}
        user={user}
        onLogout={logout}
        headerTitle={headerTitle}
        headerActions={headerActions}
      >
        <div className="rf-dashboard-card">
          <div className="rf-dashboard-toolbar">
            <div className="rf-dashboard-search">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'orders' ? 'Szukaj zlecenia...' : 'Szukaj pracownika...'}
              />
            </div>
          </div>

          {activeTab === 'orders' ? (
            <table className="rf-dashboard-table">
              <thead>
                <tr>
                  {renderSortableHeader('Numer zlecenia', 'order_number', orderSort, setOrderSort, 'desc')}
                  {renderSortableHeader('Klient', 'client', orderSort, setOrderSort)}
                  {renderSortableHeader('Sprzęt', 'device_model', orderSort, setOrderSort)}
                  {renderSortableHeader('Status', 'status', orderSort, setOrderSort)}
                  {renderSortableHeader('Utworzył', 'worker_created', orderSort, setOrderSort)}
                  {renderSortableHeader('Aktualizował', 'worker_updated', orderSort, setOrderSort)}
                  {renderSortableHeader('Termin', 'estimated_completion_date', orderSort, setOrderSort, 'desc')}
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="rf-dashboard-empty">Ładowanie zleceń...</td>
                  </tr>
                ) : sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="rf-dashboard-empty">Brak zleceń pasujących do wyszukiwania.</td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => {
                    const statusInfo = getStatusStyle(order.status);
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '700', color: '#111827' }}>{order.order_number}</td>
                        <td>{order.client ? `${order.client.first_name} ${order.client.last_name}` : 'Brak klienta'}</td>
                        <td>{order.device_model || 'Brak danych'}</td>
                        <td>
                          <span className="rf-dashboard-pill" style={{ backgroundColor: statusInfo.background, color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>{getPersonDisplayName(order.worker_created)}</td>
                        <td>{getPersonDisplayName(order.worker_updated)}</td>
                        <td>{formatDate(order.estimated_completion_date)}</td>
                        <td>
                          <div style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => openEditOrderModal(order)}
                              style={{ background: 'none', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                            >
                              <Edit size={16} />
                              Szczegóły
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{ background: 'none', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                            >
                              <Trash2 size={16} />
                              Usuń
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="rf-dashboard-table">
              <thead>
                <tr>
                  {renderSortableHeader('Imię i nazwisko', 'full_name', userSort, setUserSort)}
                  {renderSortableHeader('E-mail', 'email', userSort, setUserSort)}
                  {renderSortableHeader('Rola', 'role', userSort, setUserSort)}
                  {renderSortableHeader('Status', 'status', userSort, setUserSort)}
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="rf-dashboard-empty">Brak pracowników pasujących do wyszukiwania.</td>
                  </tr>
                ) : (
                  sortedUsers.map((listedUser) => (
                    (() => {
                      const userStatus = getUserStatusMeta(listedUser);

                      return (
                        <tr key={listedUser.id}>
                          <td style={{ fontWeight: '700', color: '#111827' }}>{listedUser.first_name} {listedUser.last_name}</td>
                          <td>{listedUser.email}</td>
                          <td>
                            <span
                              className="rf-dashboard-pill"
                              style={{
                                backgroundColor: listedUser.role === 'Admin' ? '#fce7f3' : '#e0e7ff',
                                color: listedUser.role === 'Admin' ? '#be185d' : '#4338ca',
                              }}
                            >
                              {getRoleLabel(listedUser.role)}
                            </span>
                          </td>
                          <td style={{ color: userStatus.color, fontWeight: '600' }}>
                            {userStatus.label}
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => openEditUserModal(listedUser)}
                                style={{ background: 'none', color: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                              >
                                <Edit size={16} />
                                Edytuj
                              </button>
                              <button
                                type="button"
                                disabled={deletingUserId === listedUser.id}
                                onClick={() => handleDeleteUser(listedUser)}
                                style={{
                                  background: 'none',
                                  color: '#ef4444',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: '600',
                                  opacity: deletingUserId === listedUser.id ? 0.65 : 1,
                                  cursor: deletingUserId === listedUser.id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Trash2 size={16} />
                                {deletingUserId === listedUser.id ? 'Usuwanie...' : 'Usuń'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })()
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </DashboardFrame>

      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Dodaj pracownika">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Imię</label>
            <input required type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nazwisko</label>
            <input required type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telefon</label>
            <input required type="text" value={userForm.phone_number} onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })} placeholder="+48 123 456 789" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Rola</label>
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={fieldStyle}>
              <option value="Worker">Pracownik</option>
              <option value="Admin">Administrator</option>
              <option value="User">Klient</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsUserModalOpen(false)} style={secondaryButtonStyle}>Anuluj</button>
            <button
              type="submit"
              disabled={isCreatingUser}
              style={{ ...primaryButtonStyle, opacity: isCreatingUser ? 0.7 : 1, cursor: isCreatingUser ? 'not-allowed' : 'pointer' }}
            >
              {isCreatingUser ? 'Tworzenie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Nowe zlecenie">
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Klient</label>
            <select required value={orderForm.client_id} onChange={(e) => setOrderForm({ ...orderForm, client_id: e.target.value })} style={fieldStyle}>
              <option value="">Wybierz klienta...</option>
              {clientOptions.map((listedUser) => (
                <option key={listedUser.id} value={listedUser.id}>
                  {listedUser.first_name} {listedUser.last_name} ({listedUser.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Typ urządzenia</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!showNewDeviceType ? (
                <>
                  <select required value={orderForm.device_type_id} onChange={(e) => setOrderForm({ ...orderForm, device_type_id: e.target.value })} style={{ ...fieldStyle, flex: 1 }}>
                    <option value="">Wybierz typ...</option>
                    {deviceTypes.map((deviceType) => (
                      <option key={deviceType.id} value={deviceType.id}>{deviceType.device_type}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDeviceType(true);
                      setOrderForm({ ...orderForm, device_type_id: '' });
                    }}
                    style={secondaryButtonStyle}
                  >
                    +
                  </button>
                </>
              ) : (
                <>
                  <input
                    required
                    type="text"
                    placeholder="Nazwa nowego typu..."
                    value={newDeviceTypeForm.device_type}
                    onChange={(e) => setNewDeviceTypeForm({ ...newDeviceTypeForm, device_type: e.target.value })}
                    style={{ ...fieldStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDeviceType(false);
                      setNewDeviceTypeForm({ device_type: '', description: '' });
                    }}
                    style={secondaryButtonStyle}
                  >
                    Wróć
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Model urządzenia</label>
            <input required type="text" value={orderForm.device_model} onChange={(e) => setOrderForm({ ...orderForm, device_model: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Opis usterki</label>
            <textarea required value={orderForm.issue_description} onChange={(e) => setOrderForm({ ...orderForm, issue_description: e.target.value })} rows="4" style={fieldStyle} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsOrderModalOpen(false)} style={secondaryButtonStyle}>Anuluj</button>
            <button type="submit" style={primaryButtonStyle}>Zapisz zlecenie</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(editingOrder)} onClose={closeEditOrderModal} title="Historia i edycja zlecenia" maxWidth="760px">
        <form onSubmit={handleEditOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="rf-dashboard-statgrid">
            <div className="rf-dashboard-stat">
              <label>Numer zlecenia</label>
              <strong>{editingOrder?.order_number || '-'}</strong>
            </div>
            <div className="rf-dashboard-stat">
              <label>Przyjęto</label>
              <strong>{formatDate(editingOrder?.created_at)}</strong>
            </div>
            <div className="rf-dashboard-stat">
              <label>Utworzył</label>
              <strong>{getPersonDisplayName(editingOrder?.worker_created)}</strong>
            </div>
            <div className="rf-dashboard-stat">
              <label>Aktualizował</label>
              <strong>{getPersonDisplayName(editingOrder?.worker_updated)}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select required value={editOrderForm.status} onChange={(e) => setEditOrderForm({ ...editOrderForm, status: e.target.value })} style={fieldStyle}>
                {Object.entries(statusMap).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Szacowany termin</label>
              <input type="date" value={editOrderForm.estimated_completion_date} onChange={(e) => setEditOrderForm({ ...editOrderForm, estimated_completion_date: e.target.value })} style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Opis usterki</label>
            <textarea value={editingOrder?.issue_description || 'Brak opisu usterki.'} readOnly rows="4" style={readOnlyStyle} />
          </div>

          <div>
            <label style={labelStyle}>Notatka serwisowa</label>
            <textarea value={editOrderForm.service_note} onChange={(e) => setEditOrderForm({ ...editOrderForm, service_note: e.target.value })} rows="4" placeholder="Dodaj notatkę dla zlecenia..." style={fieldStyle} />
          </div>

          <div>
            <div style={{ fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Historia zmian</div>
            {editOrderLoading ? (
              <div className="rf-dashboard-empty" style={detailCardStyle}>Ładowanie historii...</div>
            ) : history.length === 0 ? (
              <div className="rf-dashboard-empty" style={detailCardStyle}>Brak zapisanej historii dla tego zlecenia.</div>
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
            <button type="button" onClick={closeEditOrderModal} style={secondaryButtonStyle}>Anuluj</button>
            <button type="submit" style={primaryButtonStyle}>Zapisz zmiany</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(editingUser)} onClose={closeEditUserModal} title="Edytuj pracownika">
        <form onSubmit={handleEditUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Imię</label>
            <input required type="text" value={editUserForm.first_name} onChange={(e) => setEditUserForm({ ...editUserForm, first_name: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nazwisko</label>
            <input required type="text" value={editUserForm.last_name} onChange={(e) => setEditUserForm({ ...editUserForm, last_name: e.target.value })} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>E-mail</label>
            <input type="email" value={editingUser?.email || ''} readOnly style={readOnlyStyle} />
          </div>
          <div>
            <label style={labelStyle}>Telefon</label>
            <input type="text" value={editingUser?.phone_number || ''} readOnly style={readOnlyStyle} />
          </div>
          <div>
            <label style={labelStyle}>Rola</label>
            <select value={editUserForm.role} onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })} style={fieldStyle}>
              <option value="Worker">Pracownik</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Obecny status</label>
            <input type="text" readOnly value={editingUser ? getUserStatusMeta(editingUser).label : 'Brak danych'} style={readOnlyStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ustaw konto jako</label>
            <select
              value={editUserForm.is_active ? 'active' : 'blocked'}
              onChange={(e) => setEditUserForm({ ...editUserForm, is_active: e.target.value === 'active' })}
              style={fieldStyle}
            >
              <option value="active">Aktywny</option>
              <option value="blocked">Zablokowany</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={closeEditUserModal} style={secondaryButtonStyle}>Anuluj</button>
            <button type="submit" style={primaryButtonStyle}>Zapisz</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
