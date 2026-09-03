import { describe, it, expect } from 'vitest';
import {
  validateRequired,
  validateEmail,
  validateMobile,
  validatePassword,
  validatePAN,
  validatePincode,
  validateGST,
} from '../../utils/validation';

describe('Seller Validation Utilities (validation.js)', () => {
  describe('validateRequired', () => {
    it('should return error message when value is empty', () => {
      expect(validateRequired('', 'Store Name')).toBe('Store Name is required');
      expect(validateRequired('   ', 'Store Name')).toBe('Store Name is required');
    });

    it('should return null when value is provided', () => {
      expect(validateRequired('Shopidoo Seller', 'Store Name')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should validate email format correctly', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('')).toBe('Email ID is required');
      expect(validateEmail('seller@shopidoo.in')).toBeNull();
    });
  });

  describe('validateMobile', () => {
    it('should require 10 digits starting with 6,7,8,9', () => {
      expect(validateMobile('1234567890')).toContain('must be 10 digits');
      expect(validateMobile('98765')).toContain('must be 10 digits');
      expect(validateMobile('9876543210')).toBeNull();
      expect(validateMobile('8876543210')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should enforce 8 characters minimum', () => {
      expect(validatePassword('')).toBe('Password is required');
      expect(validatePassword('short')).toContain('at least 8 characters');
      expect(validatePassword('StrongPass123!')).toBeNull();
    });
  });

  describe('validatePAN', () => {
    it('should validate standard Indian PAN format (5 letters, 4 digits, 1 letter)', () => {
      expect(validatePAN('ABCDE1234F')).toBeNull();
      expect(validatePAN('abcde1234f')).toBeNull();
      expect(validatePAN('INVALIDPAN')).toContain('Invalid PAN format');
      expect(validatePAN('12345ABCDE')).toContain('Invalid PAN format');
    });
  });

  describe('validatePincode', () => {
    it('should validate 6 digit pincode', () => {
      expect(validatePincode('600001')).toBeNull();
      expect(validatePincode('6000')).toContain('exactly 6 digits');
      expect(validatePincode('60000A')).toContain('exactly 6 digits');
    });
  });

  describe('validateGST', () => {
    it('should validate standard Indian GSTIN format', () => {
      expect(validateGST('22AAAAA0000A1Z5')).toBeNull();
      expect(validateGST('INVALIDGST')).toBe('Invalid GST format');
    });
  });
});
