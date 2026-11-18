// Save as: shopidoo_sellerfrontend/src/features/onboarding/prefillFromProfile.js
//
// Copies the seller's saved data from the server into the localStorage keys that the
// onboarding step forms already read (onboarding_step_1, _2, _3, _5, _6). This is the same
// mapping that BasicInfo.jsx used to do only after clicking "Continue" on step 1.

const STEP_KEYS = [1, 2, 3, 4, 5, 6].map((n) => `onboarding_step_${n}`);

const hasAny = (obj) =>
  Object.values(obj).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));

const parseCategories = (value) => {
  try {
    if (!value) return [];
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return [];
  }
};

// The saved step forms belong to exactly one seller. Call this as soon as a seller's id is
// known (login, registration, profile load): it drops whatever a previous seller left in this
// browser and records who owns the forms now, so no later step can read the wrong seller's data.
export const claimOnboardingForms = (sellerId) => {
  if (!sellerId) return;
  const owner = localStorage.getItem('onboarding_owner');
  if (owner && String(owner) !== String(sellerId)) {
    STEP_KEYS.forEach((key) => localStorage.removeItem(key));
  }
  localStorage.setItem('onboarding_owner', String(sellerId));
  localStorage.setItem('sellerId', String(sellerId));
};

// True when the saved step forms were written by somebody other than the seller we are about to
// render them for - either a different seller id, or a seller whose session has since ended.
// Unstamped forms (a brand new signup that has not registered yet) are not stale.
export const onboardingFormsAreStale = (sellerId) => {
  const owner = localStorage.getItem('onboarding_owner');
  if (!owner) return false;
  if (sellerId) return String(owner) !== String(sellerId);
  return !localStorage.getItem('sellerAccessToken');
};

export const prefillOnboardingFromProfile = (fullUser) => {
  if (!fullUser || !fullUser.id) return;

  // If a different seller used this browser before, remove their leftover form data.
  claimOnboardingForms(fullUser.id);

  // Step 1: Basic information. Written from the server like every other step, so the review
  // page never falls back to whoever filled step 1 in this browser last.
  const emailOk = Boolean(fullUser.email_verified);
  const phoneOk = Boolean(fullUser.phone_verified);
  const step1 = {
    fullName: fullUser.fullName || fullUser.name || '',
    phone: fullUser.phone || '',
    email: fullUser.email || '',
    businessType: fullUser.businessType || '',
    email_verified: emailOk ? 1 : 0,
    phone_verified: phoneOk ? 1 : 0,
    verifiedEmailValue: emailOk ? (fullUser.email || '') : '',
    verifiedPhoneValue: phoneOk ? (fullUser.phone || '') : '',
    isRegistered: fullUser.isRegistered ?? null,
  };
  if (hasAny(step1)) localStorage.setItem('onboarding_step_1', JSON.stringify(step1));

  // Step 2: Business details
  const gstType = fullUser.gstType || (fullUser.gstEnrollmentId ? 'enrollment_id' : (fullUser.gstNumber ? 'gstin' : ''));
  const step2 = {
    businessName: fullUser.businessName || '',
    displayStoreName: fullUser.storeName || '',
    gstType: gstType,
    gstNumber: gstType === 'enrollment_id' ? '' : (fullUser.gstNumber || ''),
    gstEnrollmentId: fullUser.gstEnrollmentId || (gstType === 'enrollment_id' ? fullUser.gstNumber : ''),
    aadhaarNumber: fullUser.aadhaarNumber || '',
    panNumber: fullUser.panNumber || '',
    addressLine1: fullUser.addressLine1 || '',
    addressLine2: fullUser.addressLine2 || '',
    city: fullUser.city || '',
    pincode: fullUser.pincode || '',
    state: fullUser.state || '',
  };
  if (hasAny(step2)) localStorage.setItem('onboarding_step_2', JSON.stringify(step2));

  // Step 3: Bank details
  const step3 = {
    accountName: fullUser.accountName || '',
    accountNumber: fullUser.accountNumber || '',
    confirmAccountNumber: fullUser.accountNumber || '',
    ifscCode: fullUser.ifscCode || '',
  };
  if (hasAny(step3)) localStorage.setItem('onboarding_step_3', JSON.stringify(step3));

  // Step 4: Documents (the Documents page reads the key onboarding_step_5)
  const step5 = {
    gstProof: fullUser.gstProofImage ? { name: 'Uploaded GST Proof' } : null,
    panCard: fullUser.panCardImage ? { name: 'Uploaded PAN Card' } : null,
    aadhaarFront: fullUser.aadhaarFrontImage ? { name: 'Uploaded Aadhaar Front' } : null,
    aadhaarBack: fullUser.aadhaarBackImage ? { name: 'Uploaded Aadhaar Back' } : null,
    signature: fullUser.signatureImage ? { name: 'Uploaded Signature' } : null,
    businessProof: fullUser.businessProofImage ? { name: 'Uploaded Business Proof' } : null,
    bankProof: fullUser.bankProofImage ? { name: 'Uploaded Bank Proof' } : null,
  };
  if (hasAny(step5)) localStorage.setItem('onboarding_step_5', JSON.stringify(step5));

  // Step 5: Store setup (the Store Setup page reads the key onboarding_step_6)
  const step6 = {
    storeLogo: fullUser.storeLogo ? { name: 'Uploaded Store Logo' } : null,
    storeBanner: fullUser.storeBanner ? { name: 'Uploaded Store Banner' } : null,
    selectedCategories: parseCategories(fullUser.categories),
    shippingPreference: fullUser.shippingPreference || 'platform',
    pickupAddress: fullUser.pickupAddress || '',
    sameAsBusinessAddress: !fullUser.pickupAddress,
  };
  if (step6.storeLogo || step6.storeBanner || step6.selectedCategories.length > 0 || step6.pickupAddress) {
    localStorage.setItem('onboarding_step_6', JSON.stringify(step6));
  }
};
