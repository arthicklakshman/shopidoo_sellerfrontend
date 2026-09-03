import { describe, it, expect } from 'vitest';
import onboardingReducer, {
  setSellerId,
  saveStepData,
  setStep,
  resetOnboarding,
} from '../../features/onboarding/onboardingSlice';

describe('Seller Onboarding Slice (onboardingSlice.js)', () => {
  const initialState = {
    sellerId: null,
    basicInfo: {},
    business: {},
    bank: {},
    documents: {},
    store: {},
    currentStep: 1,
  };

  it('should return initial state', () => {
    expect(onboardingReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setSellerId', () => {
    const state = onboardingReducer(initialState, setSellerId('uuid-1234'));
    expect(state.sellerId).toBe('uuid-1234');
  });

  it('should handle saveStepData for business details', () => {
    const businessData = {
      storeName: 'Awesome Electronics',
      gstNumber: '22AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
    };
    const state = onboardingReducer(
      initialState,
      saveStepData({ step: 'business', data: businessData })
    );
    expect(state.business).toEqual(businessData);
  });

  it('should handle setStep', () => {
    const state = onboardingReducer(initialState, setStep(3));
    expect(state.currentStep).toBe(3);
  });

  it('should handle resetOnboarding', () => {
    const populated = {
      ...initialState,
      sellerId: 'uuid-123',
      currentStep: 5,
    };
    const state = onboardingReducer(populated, resetOnboarding());
    expect(state).toEqual(initialState);
  });
});
