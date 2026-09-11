import api from '../../services/api';

const getSellerId = () => {
  try {
    return JSON.parse(localStorage.getItem('sellerUser') || '{}')?.id;
  } catch {
    return null;
  }
};

const sellerPath = () => {
  const sellerId = getSellerId();
  if (!sellerId) throw new Error('Seller session missing. Please login again.');
  return `/seller/${sellerId}`;
};

export const getStoreInfoAPI = async () => {
  const { data } = await api.get(sellerPath());
  return {
    ...data,
    data: {
      ...data.data,
      storeName: data.data?.storeName || data.data?.businessName || '',
      email: data.data?.email || '',
      phone: data.data?.phone || '',
      logo: data.data?.storeLogo || data.data?.avatar || null,
    },
  };
};

export const updateStoreInfoAPI = async (form) => {
  const { data } = await api.put(`${sellerPath()}/store-setup`, {
    storeName: form.storeName,
    email: form.email,
    phone: form.phone,
    description: form.description,
    categories: form.categories,
    storeLogo: form.logo,
    shippingPreference: form.shippingPreference,
    selfShippingRate: form.selfShippingRate,
  });
  return data;
};

export const getBankDetailsAPI = async () => {
  const { data } = await api.get(sellerPath());
  return {
    ...data,
    data: {
      ...data.data,
      accountName: data.data?.accountName || '',
      accountNumber: data.data?.accountNumber || '',
      routingNumber: data.data?.ifscCode || data.data?.routingNumber || '',
      ifscCode: data.data?.ifscCode || data.data?.routingNumber || '',
    },
  };
};

export const updateBankDetailsAPI = async (form) => {
  const { data } = await api.put(`${sellerPath()}/bank-details`, {
    accountName: form.accountName,
    accountNumber: form.accountNumber,
    ifscCode: form.routingNumber || form.ifscCode,
  });
  return data;
};

export const getPickupAddressAPI = async () => {
  const { data } = await api.get(sellerPath());
  return data;
};

export const updatePickupAddressAPI = async (form) => {
  const parts = [
    form.address1 ? form.address1.trim() : '',
    form.address2 ? form.address2.trim() : '',
    form.city ? form.city.trim() : '',
  ].filter(Boolean);
  let pickupAddr = parts.join(', ');
  if (form.state) pickupAddr += `, ${form.state.replace(/_/g, ' ').toUpperCase()}`;
  if (form.zip) pickupAddr += ` - ${form.zip.trim()}`;

  const { data } = await api.put(`${sellerPath()}/business`, {
    addressLine1: form.address1,
    addressLine2: form.address2,
    city: form.city,
    state: form.state,
    pincode: form.zip,
    pickupAddress: pickupAddr,
  });
  return data;
};

export const updateSecurityAPI = async (payload) => {
  if (payload.newPassword) {
    if (payload.currentPassword) {
      await api.put('/auth/change-password', {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
    } else {
      await api.post('/auth/reset-password', {
        email: payload.email,
        newPassword: payload.newPassword,
        role: 'seller',
      });
    }
  }

  const { data } = await api.put(`${sellerPath()}/store-setup`, {
    twoFactor: payload.twoFactor,
  });
  return data;
};

export const getNotificationPreferencesAPI = async () => {
  const { data } = await api.get(sellerPath());
  return data;
};

export const updateNotificationPreferencesAPI = async (preferences) => {
  const { data } = await api.put(`${sellerPath()}/store-setup`, {
    notificationPreferences: preferences,
  });
  return data;
};
