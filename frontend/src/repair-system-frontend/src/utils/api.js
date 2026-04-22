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

const knownErrorMessages = [
  {
    match: 'user with same creds already exists',
    message: 'Uzytkownik z takim adresem e-mail lub numerem telefonu juz istnieje.',
  },
];

function normalizeErrorDetail(detail) {
  if (!detail) {
    return '';
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.msg) {
          return item.msg;
        }

        return '';
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (typeof detail === 'object') {
    if (typeof detail.msg === 'string') {
      return detail.msg;
    }

    try {
      return JSON.stringify(detail);
    } catch {
      return '';
    }
  }

  return '';
}

export function extractApiErrorMessage(payload, fallbackMessage = 'Wystapil blad.') {
  const rawMessage =
    normalizeErrorDetail(payload?.detail) ||
    normalizeErrorDetail(payload?.message) ||
    normalizeErrorDetail(payload?.error) ||
    '';

  if (!rawMessage) {
    return fallbackMessage;
  }

  const matchedError = knownErrorMessages.find(({ match }) => rawMessage.toLowerCase().includes(match));
  return matchedError?.message || rawMessage;
}
