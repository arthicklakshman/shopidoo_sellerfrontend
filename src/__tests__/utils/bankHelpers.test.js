import { describe, it, expect } from 'vitest';
import { findBankName } from '../../utils/bankHelpers';

describe('Bank Helpers (bankHelpers.js)', () => {
  it('should return empty string if IFSC is too short', () => {
    expect(findBankName('')).toBe('');
    expect(findBankName('SBI')).toBe('');
  });

  it('should identify popular Indian banks by IFSC prefix', () => {
    expect(findBankName('SBIN0001234')).toBe('State Bank of India');
    expect(findBankName('HDFC0005678')).toBe('HDFC Bank');
    expect(findBankName('ICIC0009999')).toBe('ICICI Bank');
    expect(findBankName('UTIB0001111')).toBe('Axis Bank');
    expect(findBankName('PUNB0002222')).toBe('Punjab National Bank');
  });

  it('should return fallback message for unmapped IFSC codes', () => {
    expect(findBankName('XYZB0001234')).toBe('Bank will be verified from IFSC');
  });
});
