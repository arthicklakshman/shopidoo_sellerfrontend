import api from '../../services/api';


const API_BASE_URL = '/auth';
const SELLER_API = '/seller';

const onboardingService = {

  sendEmailOtp: async (email) => {
    return await api.post(`${API_BASE_URL}/send-otp`, { email });
  },
  
  sendMobileOtp: async (mobile) => {
    return await api.post(`${API_BASE_URL}/send-otp`, { mobile });
  },

  verifyEmailOtp: async (email, otp) => {
    return await api.post(`${API_BASE_URL}/verify-otp`, { email, otp });
  },

  verifyMobileOtp: async (mobile, otp) => {
    return await api.post(`${API_BASE_URL}/verify-otp`, { mobile, otp });
  },

  /**
   * STEP 1: Basic Information
   * POST for new registration, PUT for editing existing data
   */
  registerBasicInfo: async (data) => {
    return await api.post(
      `${API_BASE_URL}/register`,
      {
        name: data.fullName,
        email: data.emailId,
        phone: data.mobileNumber,
        mobileNumber: data.mobileNumber,
        businessType: data.businessType,
        password: data.password,
        role: 'seller'
      }
    );
  },

  updateBasicInfo: async (sellerId, data) => {
    return await api.put(`${SELLER_API}/${sellerId}/basic`, data);
  },

  /**
   * STEP 2: Business Details
   */
  updateBusinessDetails: async (sellerId, data) => {
    return await api.put(`${SELLER_API}/${sellerId}/business`, data);
  },

  /**
   * STEP 3: Bank Details
   */
  updateBankDetails: async (sellerId, data) => {
    return await api.put(`${SELLER_API}/${sellerId}/bank-details`, data);
  },

  /**
   * STEP 4: Documents (Identity)
   */
  updateDocuments: async (sellerId, data) => {
    return await api.put(`${SELLER_API}/${sellerId}/documents`, data);
  },

  /**
   * STEP 5: Store Setup & Logistics
   */
  updateStoreSetup: async (sellerId, data) => {
    return await api.put(`${SELLER_API}/${sellerId}/store-setup`, data);
  },

  /**
   * STEP 5 HELPER: Get Categories from DB
   */
  getCategories: async () => {
    return await api.get('/categories');
  },

  /**
   * FINAL STEP: Complete Onboarding (Final Submit)
   */
  completeOnboarding: async (sellerId) => {
    const finalPayload = {
      status: 'pending',
      isRegistered: true
    };
    return await api.put(`${SELLER_API}/${sellerId}/complete`, finalPayload);
  }
};

export default onboardingService;



// import api from '../../services/api';

// const API_BASE_URL = '/auth';
// const SELLER_API = '/seller';

// const onboardingService = {

//   /**
//    * OTP VERIFICATION (Email)
//    */
//   sendEmailOtp: async (email) => {
//     return await api.post(`${API_BASE_URL}/send-email-otp`, { email });
//   },
  
//   /**
//    * OTP VERIFICATION (Email)
//    */
//  sendMobileOtp: async (mobile) => {
//   return await api.post(`${API_BASE_URL}/send-email-otp`, { mobile });
// },

//   verifyEmailOtp: async (email, otp) => {
//     return await api.post(`${API_BASE_URL}/verify-email-otp`, { email, otp });
//   },

//   /**
//    * STEP 1: Basic Information
//    * POST for new registration, PUT for editing existing data
//    */
//   registerBasicInfo: async (data) => {
//     return await api.post(
//       `${API_BASE_URL}/register`,
//       {
//         name: data.fullName,
//         email: data.emailId,
//         phone: data.mobileNumber,
//         mobileNumber: data.mobileNumber,
//         businessType: data.businessType,
//         password: data.password,
//         role: 'seller'
//       }
//     );
//   },

//   updateBasicInfo: async (sellerId, data) => {
//     return await api.put(`${SELLER_API}/${sellerId}/basic`, data);
//   },

//   /**
//    * STEP 2: Business Details
//    */
//   updateBusinessDetails: async (sellerId, data) => {
//     return await api.put(`${SELLER_API}/${sellerId}/business`, data);
//   },

//   /**
//    * STEP 3: Bank Details
//    */
//   updateBankDetails: async (sellerId, data) => {
//     return await api.put(`${SELLER_API}/${sellerId}/bank-details`, data);
//   },

//   /**
//    * STEP 4: Documents (Identity)
//    */
//   updateDocuments: async (sellerId, data) => {
//     return await api.put(`${SELLER_API}/${sellerId}/documents`, data);
//   },

//   /**
//    * STEP 5: Store Setup & Logistics
//    */
//   updateStoreSetup: async (sellerId, data) => {
//     return await api.put(`${SELLER_API}/${sellerId}/store-setup`, data);
//   },

//   /**
//    * STEP 5 HELPER: Get Categories from DB
//    */
//   getCategories: async () => {
//     return await api.get('/categories');
//   },

//   /**
//    * FINAL STEP: Complete Onboarding (Final Submit)
//    */
//   completeOnboarding: async (sellerId) => {
//     const finalPayload = {
//       status: 'pending',
//       isRegistered: true
//     };
//     return await api.put(`${SELLER_API}/${sellerId}/complete`, finalPayload);
//   }
// };

// export default onboardingService;
