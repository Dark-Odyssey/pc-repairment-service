export function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.result)) {
    return payload.result;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}
