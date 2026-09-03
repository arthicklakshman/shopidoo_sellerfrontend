import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import onboardingReducer, {
  saveStepData,
  setStep,
} from '../../features/onboarding/onboardingSlice';
import {
  validateEmail,
  validateMobile,
  validatePAN,
  validateGST,
  validatePincode,
} from '../../utils/validation';
import { findBankName } from '../../utils/bankHelpers';

describe('Seller Store Setup & Onboarding Flow (StoreSetupFlow.test.jsx)', () => {
  it('should validate inputs, capture store state, and step through onboarding wizard', () => {
    const store = configureStore({
      reducer: { onboarding: onboardingReducer },
    });

    // Step 1: Basic Seller Profile Validation
    const sellerEmail = 'merchant@shopidoo.in';
    const sellerPhone = '9876543210';
    expect(validateEmail(sellerEmail)).toBeNull();
    expect(validateMobile(sellerPhone)).toBeNull();

    store.dispatch(
      saveStepData({
        step: 'basicInfo',
        data: { email: sellerEmail, phone: sellerPhone, name: 'Merchant One' },
      })
    );
    store.dispatch(setStep(2));
    expect(store.getState().onboarding.currentStep).toBe(2);

    // Step 2: Business & Tax Validation (PAN & GST)
    const pan = 'ABCDE1234F';
    const gst = '22AAAAA0000A1Z5';
    expect(validatePAN(pan)).toBeNull();
    expect(validateGST(gst)).toBeNull();

    store.dispatch(
      saveStepData({
        step: 'business',
        data: { panNumber: pan, gstNumber: gst, legalName: 'Merchant One LLC' },
      })
    );
    store.dispatch(setStep(3));

    // Step 3: Bank Account & IFSC Lookup
    const ifsc = 'SBIN0001234';
    const bankName = findBankName(ifsc);
    expect(bankName).toBe('State Bank of India');

    store.dispatch(
      saveStepData({
        step: 'bank',
        data: { ifscCode: ifsc, bankName, accountNumber: '123456789012' },
      })
    );

    // Step 4: Store Pickup Address & Pincode Validation
    const pickupPin = '560001';
    expect(validatePincode(pickupPin)).toBeNull();

    store.dispatch(
      saveStepData({
        step: 'store',
        data: {
          storeName: 'Merchant Store',
          pickupPincode: pickupPin,
          city: 'Bengaluru',
          state: 'Karnataka',
        },
      })
    );

    const finalState = store.getState().onboarding;
    expect(finalState.basicInfo.name).toBe('Merchant One');
    expect(finalState.business.panNumber).toBe('ABCDE1234F');
    expect(finalState.bank.bankName).toBe('State Bank of India');
    expect(finalState.store.pickupPincode).toBe('560001');
  });
});
