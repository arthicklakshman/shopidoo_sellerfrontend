import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import {
  prefillOnboardingFromProfile,
  claimOnboardingForms,
  onboardingFormsAreStale,
} from '../../features/onboarding/prefillFromProfile';

// ReviewSubmit reads Basic Information from the authenticated seller's profile.
vi.mock('../../features/onboarding/onboarding.service', () => ({
  default: {
    getProfile: vi.fn(),
    completeOnboarding: vi.fn(),
  },
}));

import onboardingService from '../../features/onboarding/onboarding.service';
import ReviewSubmit from '../../features/onboarding/steps/ReviewSubmit';

const SELLER_A = {
  id: 101,
  name: 'Seller A',
  fullName: 'Seller A',
  email: 'seller.a@shopidoo.in',
  phone: '9000000001',
  businessType: 'sole_proprietor',
  role: 'seller',
  email_verified: true,
  phone_verified: true,
};

const SELLER_B = {
  id: 202,
  name: 'Seller B',
  fullName: 'Seller B',
  email: 'seller.b@shopidoo.in',
  phone: '9000000002',
  businessType: 'private_limited',
  role: 'seller',
  email_verified: true,
  phone_verified: true,
};

const renderReviewStep = (authUser) =>
  render(
    <Provider
      store={configureStore({
        reducer: { auth: () => ({ user: authUser, isAuthenticated: !!authUser, authChecked: true }) },
      })}
    >
      <ReviewSubmit onBack={() => {}} onNext={() => {}} onEditStep={() => {}} />
    </Provider>
  );

describe('Step 6 Basic Information belongs to the authenticated seller', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('prefills step 1 from the server profile, not just steps 2-6', () => {
    prefillOnboardingFromProfile(SELLER_B);

    const step1 = JSON.parse(localStorage.getItem('onboarding_step_1'));
    expect(step1.fullName).toBe('Seller B');
    expect(step1.email).toBe('seller.b@shopidoo.in');
    expect(step1.phone).toBe('9000000002');
    expect(localStorage.getItem('onboarding_owner')).toBe('202');
  });

  it('drops a previous seller\'s saved forms when a new seller claims the browser', () => {
    // Seller A leaves data behind in this browser.
    claimOnboardingForms(SELLER_A.id);
    localStorage.setItem('onboarding_step_1', JSON.stringify({ fullName: 'Seller A', email: SELLER_A.email }));
    localStorage.setItem('onboarding_step_2', JSON.stringify({ businessName: 'A Traders' }));

    // Seller B registers / logs in on the same browser.
    claimOnboardingForms(SELLER_B.id);

    expect(localStorage.getItem('onboarding_step_1')).toBeNull();
    expect(localStorage.getItem('onboarding_step_2')).toBeNull();
    expect(localStorage.getItem('onboarding_owner')).toBe('202');
    expect(localStorage.getItem('sellerId')).toBe('202');
  });

  it('flags saved forms as stale for a different seller or an ended session', () => {
    // No owner stamp yet: a brand new signup mid-step-1 keeps its own typed data.
    expect(onboardingFormsAreStale(null)).toBe(false);

    claimOnboardingForms(SELLER_A.id);
    localStorage.setItem('sellerAccessToken', 'token-a');

    expect(onboardingFormsAreStale(SELLER_A.id)).toBe(false);
    expect(onboardingFormsAreStale(SELLER_B.id)).toBe(true);

    // Seller A logged out / used Save & Exit: the leftovers must not be shown to anyone.
    localStorage.removeItem('sellerAccessToken');
    expect(onboardingFormsAreStale(null)).toBe(true);
  });

  it('renders the authenticated seller, not the leftover step 1 in local storage', async () => {
    // Seller A's registration details are still sitting in this browser.
    localStorage.setItem('onboarding_owner', String(SELLER_A.id));
    localStorage.setItem('onboarding_step_1', JSON.stringify({
      fullName: 'Seller A', email: SELLER_A.email, phone: SELLER_A.phone, businessType: 'sole_proprietor',
    }));
    // Seller B is the one actually signed in.
    localStorage.setItem('sellerAccessToken', 'token-b');
    localStorage.setItem('sellerId', String(SELLER_B.id));
    onboardingService.getProfile.mockResolvedValue({ data: { data: SELLER_B } });

    renderReviewStep(SELLER_B);

    await waitFor(() => expect(screen.getByText('Seller B')).toBeInTheDocument());
    expect(screen.getByText('seller.b@shopidoo.in')).toBeInTheDocument();
    expect(screen.getByText('9000000002')).toBeInTheDocument();

    // Seller A must appear nowhere on the review page.
    expect(screen.queryByText('Seller A')).not.toBeInTheDocument();
    expect(screen.queryByText(SELLER_A.email)).not.toBeInTheDocument();
    expect(screen.queryByText(SELLER_A.phone)).not.toBeInTheDocument();
  });

  it('shows the seller\'s own other sections alongside their Basic Information', async () => {
    // Seller B owns this browser's saved forms (set at registration / login).
    claimOnboardingForms(SELLER_B.id);
    localStorage.setItem('sellerAccessToken', 'token-b');
    localStorage.setItem('onboarding_step_2', JSON.stringify({
      businessName: 'B Enterprises', gstType: 'gstin', gstNumber: '27AAPFU0939F1ZV',
      panNumber: 'ABCDE1234F', addressLine1: '12 Market Road', city: 'Chennai', state: 'tamil_nadu', pincode: '600001',
    }));
    onboardingService.getProfile.mockResolvedValue({ data: { data: SELLER_B } });

    renderReviewStep(SELLER_B);

    await waitFor(() => expect(screen.getByText('Seller B')).toBeInTheDocument());
    expect(screen.getByText('B Enterprises')).toBeInTheDocument();
    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
  });
});
