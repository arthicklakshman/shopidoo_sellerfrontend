import { describe, it, expect, beforeEach } from 'vitest';
import { isEnrollmentUser, getCachedSellerGstType } from '../../pages/ProductForm/ProductForm';

describe('GST Flicker Prevention & Enrollment Identification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly identifies enrollment sellers via isEnrollmentUser', () => {
    // Enrollment seller with explicit gstType
    expect(isEnrollmentUser({ gstType: 'enrollment_id' })).toBe(true);

    // Enrollment seller with gstEnrollmentId property
    expect(isEnrollmentUser({ gstEnrollmentId: '123456789012345' })).toBe(true);

    // Enrollment seller with numeric 15-digit ID stored in gstNumber
    expect(isEnrollmentUser({ gstNumber: '241234567890123' })).toBe(true);

    // Standard GSTIN seller
    expect(isEnrollmentUser({ gstType: 'gstin', gstNumber: '27AAPFU0939F1ZV' })).toBe(false);
    expect(isEnrollmentUser({ gstNumber: '27AAPFU0939F1ZV' })).toBe(false);
    expect(isEnrollmentUser(null)).toBe(false);
    expect(isEnrollmentUser({})).toBe(false);
  });

  it('synchronously retrieves cached seller GST type from multiple storage fallbacks', () => {
    // 1. Specific seller key in localStorage
    localStorage.setItem('seller_gst_type_seller99', 'enrollment_id');
    expect(getCachedSellerGstType('seller99')).toBe('enrollment_id');
    localStorage.clear();

    // 2. Global seller_gst_type key
    localStorage.setItem('seller_gst_type', 'enrollment_id');
    expect(getCachedSellerGstType()).toBe('enrollment_id');
    localStorage.clear();

    // 3. Stored sellerUser object
    localStorage.setItem('sellerUser', JSON.stringify({ id: 'user1', gstType: 'enrollment_id' }));
    expect(getCachedSellerGstType()).toBe('enrollment_id');
    localStorage.clear();

    // 4. Stored onboarding_step_2 object
    localStorage.setItem('onboarding_step_2', JSON.stringify({ gstType: 'enrollment_id' }));
    expect(getCachedSellerGstType()).toBe('enrollment_id');
    localStorage.clear();

    // 5. Standard GSTIN seller returns gstin
    localStorage.setItem('seller_gst_type', 'gstin');
    expect(getCachedSellerGstType()).toBe('gstin');
  });
});
