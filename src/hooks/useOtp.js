
import { useState } from 'react';
import onboardingService from '../features/onboarding/onboarding.service';

export const useOtp = () => {
  const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', targetValue: '' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const sendOtp = async (type, targetValue) => {
    setOtpError('');
    try {
      if (type === 'email') {
        await onboardingService.sendEmailOtp(targetValue);
      } else {
        await onboardingService.sendMobileOtp(targetValue);
      }
      setOtpModal({ isOpen: true, type, targetValue });
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (otpValue) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await onboardingService.verifyEmailOtp(otpModal.targetValue, otpValue);
      if (otpModal.type === 'email') setIsEmailVerified(true);
      if (otpModal.type === 'mobile') setIsMobileVerified(true);
      setOtpModal({ isOpen: false, type: '', targetValue: '' });
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid or expired OTP.');
      throw error;
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtpError('');
    try {
      if (otpModal.type === 'email') {
        await onboardingService.sendEmailOtp(otpModal.targetValue);
      } else {
        await onboardingService.sendMobileOtp(otpModal.targetValue);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const closeOtpModal = () => {
    setOtpModal({ isOpen: false, type: '', targetValue: '' });
    setOtpError('');
  };

  const resetVerification = (type) => {
    if (type === 'email') setIsEmailVerified(false);
    if (type === 'mobile') setIsMobileVerified(false);
  };

  return {
    otpModal,
    otpLoading,
    otpError,
    isEmailVerified,
    isMobileVerified,
    sendOtp,
    verifyOtp,
    resendOtp,
    closeOtpModal,
    resetVerification
  };
};
