const GUEST_CUSTOMER_ID_KEY = 'salonGuestCustomerId';

export const getCustomerId = (fallbackCustomerId = '') => {
  if (fallbackCustomerId) {
    return fallbackCustomerId;
  }

  const loggedInUserId = localStorage.getItem('userId');
  if (loggedInUserId && loggedInUserId !== 'guest-user') {
    return loggedInUserId;
  }

  const existingGuestId = localStorage.getItem(GUEST_CUSTOMER_ID_KEY);
  if (existingGuestId) {
    return existingGuestId;
  }

  const generatedGuestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(GUEST_CUSTOMER_ID_KEY, generatedGuestId);

  return generatedGuestId;
};