// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/v1", // 🔥 your backend URL
//   withCredentials: true,
// });

// // 👉 Add token automatically (if using auth)
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("sellerAccessToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ✅ Update Security API
// export const updateSecurityAPI = async (payload) => {
//   const response = await API.put("/seller/settings/security", payload);
//   return response.data;
// };





// // Get Bank Details
// export const getBankDetailsAPI = async () => {
//   // ✅ Added /seller to the path
//   const response = await API.get("/seller/settings/bank-details"); 
//   return response.data;
// };

// // Update Bank Details
// export const updateBankDetailsAPI = async (payload) => {
//   // ✅ Added /seller to the path
//   const response = await API.put("/seller/settings/bank-details", payload);
//   return response.data;
// };











// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/v1", // 🔥 your backend URL
//   withCredentials: true,
// });

// // 👉 Add token automatically (if using auth)
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("sellerAccessToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("sellerAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Store Info
export const getStoreInfoAPI = async () => {
  const response = await API.get("/seller/settings/store-info");
  return response.data;
};

export const updateStoreInfoAPI = async (payload) => {
  const response = await API.put("/seller/settings/store-info", payload);
  return response.data;
};

// Security
export const updateSecurityAPI = async (payload) => {
  const response = await API.put("/seller/settings/security", payload);
  return response.data;
};

// Bank
export const getBankDetailsAPI = async () => {
  const response = await API.get("/seller/settings/bank-details");
  return response.data;
};

export const updateBankDetailsAPI = async (payload) => {
  const response = await API.put("/seller/settings/bank-details", payload);
  return response.data;
};

// Pickup
export const getPickupAddressAPI = async () => {
  const response = await API.get("/seller/settings/pickup-address");
  return response.data;
};

export const updatePickupAddressAPI = async (payload) => {
  const response = await API.put("/seller/settings/pickup-address", payload);
  return response.data;
};


// //store info on settings 
// export const getStoreInfoAPI = async () => {
//   const response = await API.get("/seller-settings/store-info"); // 🌟 Ensure this is /seller-settings
//   return response.data;
// };

// export const updateStoreInfoAPI = async (payload) => {
//   const response = await API.put("/seller-settings/store-info", payload); // 🌟 Ensure this is /seller-settings
//   return response.data;
// };

// // ✅ Update Security API
// export const updateSecurityAPI = async (payload) => {
//   // 🌟 FIXED: Changed from /seller/settings/ to /seller-settings/
//   const response = await API.put("/seller-settings/security", payload);
//   return response.data;
// };

// // Get Bank Details
// export const getBankDetailsAPI = async () => {
//   // 🌟 FIXED: Changed from /seller/settings/ to /seller-settings/
//   const response = await API.get("/seller-settings/bank-details"); 
//   return response.data;
// };

// // Update Bank Details
// export const updateBankDetailsAPI = async (payload) => {
//   // 🌟 FIXED: Changed from /seller/settings/ to /seller-settings/
//   const response = await API.put("/seller-settings/bank-details", payload);
//   return response.data;
// };

// export const getPickupAddressAPI = async () => {
//   // 🌟 FIXED: Changed from /seller/settings/ to /seller-settings/
//   const response = await API.get("/seller-settings/pickup-address"); 
//   return response.data;
// };

// export const updatePickupAddressAPI = async (payload) => {
//   // 🌟 FIXED: Changed from /seller/settings/ to /seller-settings/
//   const response = await API.put("/seller-settings/pickup-address", payload);
//   return response.data;
// };


// export const getPickupAddressAPI = async () => {
//   const response = await API.get("/seller/settings/pickup-address"); 
//   return response.data;
// };

// export const updatePickupAddressAPI = async (payload) => {
//   const response = await API.put("/seller/settings/pickup-address", payload);
//   return response.data;
// };




// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/v1", // 🔥 your backend URL
//   withCredentials: true,
// });

// // 👉 Add token automatically (if using auth)
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("sellerAccessToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // 🏪 Store info on settings 
// export const getStoreInfoAPI = async () => {
//   // 🌟 REVERTED: Now matches the new modular backend hub
//   const response = await API.get("/seller/settings/store-info"); 
//   return response.data;
// };

// export const updateStoreInfoAPI = async (payload) => {
//   const response = await API.put("/seller/settings/store-info", payload); 
//   return response.data;
// };

// // 🔒 Update Security API
// export const updateSecurityAPI = async (payload) => {
//   const response = await API.put("/seller/settings/security", payload);
//   return response.data;
// };

// // 🏦 Get Bank Details
// export const getBankDetailsAPI = async () => {
//   const response = await API.get("/seller/settings/bank-details"); 
//   return response.data;
// };

// // 🏦 Update Bank Details
// export const updateBankDetailsAPI = async (payload) => {
//   const response = await API.put("/seller/settings/bank-details", payload);
//   return response.data;
// };

// // 📍 Get Pickup Address
// export const getPickupAddressAPI = async () => {
//   const response = await API.get("/seller/settings/pickup-address"); 
//   return response.data;
// };

// // 📍 Update Pickup Address
// export const updatePickupAddressAPI = async (payload) => {
//   const response = await API.put("/seller/settings/pickup-address", payload);
//   return response.data;
// };