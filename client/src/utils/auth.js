const AUTH_STORAGE_KEYS = ['token', 'customer', 'customer_status', 'userId'];

const base64UrlDecode = (value) => {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedValue = normalizedValue.padEnd(Math.ceil(normalizedValue.length / 4) * 4, '=');

  return window.atob(paddedValue);
};

export const getStoredAuthToken = () => localStorage.getItem('token') || '';

export const getStoredCustomer = () => {
  const rawCustomer = localStorage.getItem('customer');

  if (!rawCustomer) {
    return null;
  }

  try {
    return JSON.parse(rawCustomer);
  } catch {
    return null;
  }
};

export const parseJwtPayload = (token = '') => {
  if (!token || !token.includes('.')) {
    return null;
  }

  try {
    const [, payload] = token.split('.');
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
};

export const isTokenValid = (token = '') => {
  const payload = parseJwtPayload(token);

  if (!payload || !payload.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
};

export const getAuthSnapshot = () => {
  const token = getStoredAuthToken();

  return {
    token,
    isAuthenticated: Boolean(token) && isTokenValid(token),
    customer: getStoredCustomer(),
    payload: parseJwtPayload(token),
  };
};

export const getAuthenticatedCustomerId = (fallbackCustomerId = '') => {
  if (fallbackCustomerId) {
    return fallbackCustomerId;
  }

  const storedCustomer = getStoredCustomer();

  if (storedCustomer?._id) {
    return storedCustomer._id;
  }

  const payload = parseJwtPayload(getStoredAuthToken());

  return payload?.customer_id || payload?.customerId || '';
};

export const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};