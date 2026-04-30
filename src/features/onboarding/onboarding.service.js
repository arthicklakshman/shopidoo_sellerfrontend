import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🌟 Changed ONLY the path to point to your new backend '/seller/register' module
const API_BASE_URL = '/api/v1/auth';
const SELLER_API = '/api/v1/seller';
const onboardingService = {

  /**
   * OTP VERIFICATION (Email)
   */
  sendEmailOtp: async (email) => {
    // 🌟 This was missing or misnamed as 'sendMobileOtp'
    return await axios.post(`${API_BASE_URL}/send-email-otp`, { email });
  },
  
  /**
   * OTP VERIFICATION (Email)
   */
 sendMobileOtp: async (mobile) => {
  return await axios.post(`${API_BASE_URL}/send-email-otp`, { mobile });
},

  verifyEmailOtp: async (email, otp) => {
    return await axios.post(`${API_BASE_URL}/verify-email-otp`, { email, otp });
  },

  /**
   * STEP 1: Basic Information
   * POST for new registration, PUT for editing existing data
   */
  registerBasicInfo: async (data) => {
    return await axios.post(
 `${API_BASE_URL}/register`,
 {
   name: data.fullName,
    email: data.emailId,
   password: data.password,
   role: 'seller'
 }
);
  },

  updateBasicInfo: async (sellerId, data) => {
    return await axios.put(`${API_BASE_URL}/${sellerId}/basic`, data);
  },

  /**
   * STEP 2: Business Details
   */
  updateBusinessDetails: async (sellerId, data) => {
    // Note: data should include businessName, storeName, panNumber, etc.
    return await axios.put(`${SELLER_API}/${sellerId}/business`, data);
  },

  /**
   * STEP 3: Bank Details
   */
  updateBankDetails: async (sellerId, data) => {
    // data: accountName, accountNumber, ifscCode, bankProofImage (Base64)
    return await axios.put(`${SELLER_API}/${sellerId}/bank-details`, data);
  },

  /**
   * STEP 4: Documents (Identity)
   */
  updateDocuments: async (sellerId, data) => {
    // data: panCardImage, aadhaarFrontImage, aadhaarBackImage, signatureImage
  return await axios.put(`${SELLER_API}/${sellerId}/documents`, data);
  },

  /**
   * STEP 5: Store Setup & Logistics
   */
  updateStoreSetup: async (sellerId, data) => {
    // data: categories (stringified), shippingPreference, pickupAddress, images
    return await axios.put(`${SELLER_API}/${sellerId}/store-setup`, data);
  },

  /**
   * STEP 5 HELPER: Get Categories from DB
   */
  getCategories: async () => {
  return await axios.get('/api/v1/categories');
},

  /**
   * FINAL STEP: Complete Onboarding (Final Submit)
   */
  completeOnboarding: async (sellerId) => {
    const finalPayload = {
      status: 'pending',
      isRegistered: true
    };
    return await axios.put(`${SELLER_API}/${sellerId}/complete`, finalPayload);
  }
};

export default onboardingService;




// import axios from 'axios';

// // 🌟 Changed ONLY the path to point to your new backend '/seller/register' module
// const API_BASE_URL = 'http://localhost:5000/api/v1/seller/register';

// const onboardingService = {
  
//   /**
//    * STEP 1: Basic Information
//    * POST for new registration, PUT for editing existing data
//    */
//   registerBasicInfo: async (data) => {
//     return await axios.post(`${API_BASE_URL}`, data);
//   },

//   updateBasicInfo: async (sellerId, data) => {
//     return await axios.put(`${API_BASE_URL}/${sellerId}/basic`, data);
//   },

//   /**
//    * STEP 2: Business Details
//    */
//   updateBusinessDetails: async (sellerId, data) => {
//     // Note: data should include businessName, storeName, panNumber, etc.
//     return await axios.put(`${API_BASE_URL}/${sellerId}/business`, data);
//   },

//   /**
//    * STEP 3: Bank Details
//    */
//   updateBankDetails: async (sellerId, data) => {
//     // data: accountName, accountNumber, ifscCode, bankProofImage (Base64)
//     return await axios.put(`${API_BASE_URL}/${sellerId}/bank-details`, data);
//   },

//   /**
//    * STEP 4: Documents (Identity)
//    */
//   updateDocuments: async (sellerId, data) => {
//     // data: panCardImage, aadhaarFrontImage, aadhaarBackImage, signatureImage
//     return await axios.put(`${API_BASE_URL}/${sellerId}/documents`, data);
//   },

//   /**
//    * STEP 5: Store Setup & Logistics
//    */
//   updateStoreSetup: async (sellerId, data) => {
//     // data: categories (stringified), shippingPreference, pickupAddress, images
//     return await axios.put(`${API_BASE_URL}/${sellerId}/store-setup`, data);
//   },

//   /**
//    * STEP 5 HELPER: Get Categories from DB
//    */
//   getCategories: async () => {
//     return await axios.get(`${API_BASE_URL}/categories`);
//   },

//   /**
//    * FINAL STEP: Complete Onboarding (Final Submit)
//    */
//   completeOnboarding: async (sellerId) => {
//     const finalPayload = {
//       status: 'pending',
//       isRegistered: true
//     };
//     return await axios.put(`${API_BASE_URL}/${sellerId}/complete`, finalPayload);
//   }
// };

// export default onboardingService;
