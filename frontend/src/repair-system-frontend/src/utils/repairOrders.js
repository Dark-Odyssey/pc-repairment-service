import { extractCollection } from './api';

function normalizePerson(person) {
  if (!person || typeof person !== 'object') {
    return null;
  }

  return {
    first_name: person.first_name || '',
    last_name: person.last_name || '',
    email: person.email || '',
    phone_number: person.phone_number || '',
  };
}

function normalizeDeviceType(deviceType) {
  if (!deviceType || typeof deviceType !== 'object') {
    return null;
  }

  return {
    device_type: deviceType.device_type || '',
  };
}

export function normalizeRepairOrderHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return {
      id: null,
      repair_order_id: null,
      changed_by_employee_id: null,
      old_status: null,
      new_status: null,
      old_estimated_completion_date: null,
      new_estimated_completion_date: null,
      changed_at: null,
    };
  }

  return {
    id: entry.id ?? null,
    repair_order_id: entry.repair_order_id ?? null,
    changed_by_employee_id: entry.changed_by_employee_id ?? null,
    old_status: entry.old_status ?? null,
    new_status: entry.new_status ?? null,
    old_estimated_completion_date: entry.old_estimated_completion_date ?? null,
    new_estimated_completion_date: entry.new_estimated_completion_date ?? null,
    changed_at: entry.changed_at ?? null,
  };
}

export function normalizeRepairOrder(order) {
  if (!order || typeof order !== 'object') {
    return {
      id: null,
      order_number: '',
      client_id: null,
      device_type_id: null,
      device_model: '',
      issue_description: '',
      estimated_completion_date: null,
      service_note: '',
      status: '',
      created_by_employee_id: null,
      updated_by_employee_id: null,
      created_at: null,
      updated_at: null,
      client: null,
      worker_created: null,
      worker_updated: null,
      device_type: null,
      history: [],
    };
  }

  return {
    id: order.id ?? null,
    order_number: order.order_number || '',
    client_id: order.client_id ?? null,
    device_type_id: order.device_type_id ?? null,
    device_model: order.device_model || '',
    issue_description: order.issue_description || '',
    estimated_completion_date: order.estimated_completion_date ?? null,
    service_note: order.service_note || '',
    status: order.status || '',
    created_by_employee_id: order.created_by_employee_id ?? null,
    updated_by_employee_id: order.updated_by_employee_id ?? null,
    created_at: order.created_at ?? null,
    updated_at: order.updated_at ?? null,
    client: normalizePerson(order.client),
    worker_created: normalizePerson(order.worker_created),
    worker_updated: normalizePerson(order.worker_updated),
    device_type: normalizeDeviceType(order.device_type),
    history: Array.isArray(order.history) ? order.history.map(normalizeRepairOrderHistoryEntry) : [],
  };
}

export function extractRepairOrders(payload) {
  return extractCollection(payload).map(normalizeRepairOrder);
}
