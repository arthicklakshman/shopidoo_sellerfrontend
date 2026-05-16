import { useState } from 'react';
import onboardingService from '../features/onboarding/onboarding.service'; 

export const useOtp = () => {
  const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', targetValue: '' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const sendOtp = async (type, targetValue) => {
    setOtpError('');
    try {
      if (type === 'mobile') {
        await onboardingService.sendMobileOtp(targetValue);
      } else if (type === 'email') {
        await onboardingService.sendEmailOtp(targetValue);
      }
      setOtpModal({ isOpen: true, type, targetValue });
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to send ${type === 'mobile' ? 'SMS' : 'OTP'}.`);
    }
  };

  const verifyOtp = async (otpValue) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      if (otpModal.type === 'email') {
        await onboardingService.verifyEmailOtp(otpModal.targetValue, otpValue);
        setIsEmailVerified(true);
      } else if (otpModal.type === 'mobile') {
        await onboardingService.verifyMobileOtp(otpModal.targetValue, otpValue);
        setIsMobileVerified(true);
      }
      setOtpModal({ isOpen: false, type: '', targetValue: '' });
      return true;
    } catch (error) {
      setOtpError(error.response?.data?.message || "Invalid or expired OTP.");
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtpError('');
    try {
      if (otpModal.type === 'email') {
        await onboardingService.sendEmailOtp(otpModal.targetValue);
      } else if (otpModal.type === 'mobile') {
        await onboardingService.sendMobileOtp(otpModal.targetValue);
      }
      return true;
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
      return false;
    }
  };

  const closeOtpModal = () => setOtpModal({ isOpen: false, type: '', targetValue: '' });

  const resetVerification = (type) => {
    if (type === 'mobile') setIsMobileVerified(false);
    if (type === 'email') setIsEmailVerified(false);
  };

  return {
    otpModal, otpLoading, otpError, isMobileVerified, isEmailVerified,
    sendOtp, verifyOtp, resendOtp, closeOtpModal, resetVerification
  };
};