import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sellerId: null, // 🌟 Store the UUID here for easy access across all steps
  basicInfo: {},
  business: {},
  bank: {},
  documents: {},
  store: {},
  currentStep: 1
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // 🌟 New reducer to set the ID specifically
    setSellerId: (state, action) => {
      state.sellerId = action.payload;
    },
    saveStepData: (state, action) => {
      const { step, data } = action.payload;
      state[step] = data;
    },
    // Optional: Keep track of which step the user is on
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    // Clear everything after successful submission (Step 7)
    resetOnboarding: () => initialState
  }
});

export const { setSellerId, saveStepData, setStep, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;





// // features/onboarding/onboardingSlice.js

// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   basicInfo: {},
//   business: {},
//   bank: {},
//   documents: {},
//   store: {}
// };

// const onboardingSlice = createSlice({
//   name: 'onboarding',
//   initialState,
//   reducers: {
//     saveStepData: (state, action) => {
//       const { step, data } = action.payload;
//       state[step] = data;
//     }
//   }
// });

// export const { saveStepData } = onboardingSlice.actions;
// export default onboardingSlice.reducer;