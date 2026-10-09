// Save as: shopidoo_sellerfrontend/src/features/onboarding/prefillFromProfile.js
//
// Copies the seller's saved data from the server into the localStorage keys that the
// onboarding step forms already read (onboarding_step_2, _3, _5, _6). This is the same
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

export const prefillOnboardingFromProfile = (fullUser) => {
  if (!fullUser || !fullUser.id) return;

  // If a different seller used this browser before, remove their leftover form data.
  const owner = localStorage.getItem('onboarding_owner');
  if (owner && String(owner) !== String(fullUser.id)) {
    STEP_KEYS.forEach((key) => localStorage.removeItem(key));
  }
  localStorage.setItem('onboarding_owner', String(fullUser.id));
  localStorage.setItem('sellerId', String(fullUser.id));

  // Step 2: Business details
  const step2 = {
    businessName: fullUser.businessName || '',
    displayStoreName: fullUser.storeName || '',
    gstNumber: fullUser.gstNumber || '',
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