// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../features/auth/authSlice';
// import uiReducer from '../features/ui/uiSlice';
// export const store = configureStore({
//   reducer: { auth: authReducer, ui: uiReducer },
//   middleware: (g) => g({ serializableCheck: false }),
// });


import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import onboardingReducer from '../features/onboarding/onboardingSlice';

export const store = configureStore({
  reducer: { 
    auth: authReducer,
    ui: uiReducer,
    onboarding: onboardingReducer
  },

  middleware: (g) => g({
    serializableCheck: false
  }),
});