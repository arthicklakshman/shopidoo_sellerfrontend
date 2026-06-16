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
      email: data.data?.email || data.data?.email,
      logo: data.data?.storeLogo,
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
      accountName: data.data?.accountName,
      accountNumber: data.data?.accountNumber,
      routingNumber: data.data?.ifscCode,
    },
  };
};

export const updateBankDetailsAPI = async (form) => {
  const { data } = await api.put(`${sellerPath()}/bank-details`, {
    accountName: form.accountName,
    accountNumber: form.accountNumber,
    ifscCode: form.routingNumber,
  });
  return data;
};

export const getPickupAddressAPI = async () => {
  const { data } = await api.get(sellerPath());
  return data;
};

export const updatePickupAddressAPI = async (form) => {
  const { data } = await api.put(`${sellerPath()}/business`, {
    addressLine1: form.address1,
    addressLine2: form.address2,
    city: form.city,
    state: form.state,
    pincode: form.zip,
  });
  return data;
};

export const updateSecurityAPI = async (payload) => {
  if (payload.currentPassword && payload.newPassword) {
    await api.put('/auth/change-password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
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
