import { useState } from 'react';
import onboardingService from '../features/onboarding/onboarding.service';

export const useOtp = () => {
  // 🌟 Added 'actionType' to track which MSG91 template to use (defaults to 'register')
  const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', targetValue: '', actionType: 'register' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  // 🌟 Accept actionType and role from the UI component
  const sendOtp = async (type, targetValue, actionType = 'register', role = 'seller') => {
    setOtpError('');
    try {
      if (type === 'email') {
        await onboardingService.sendEmailOtp(targetValue, actionType, role);
      } else {
        await onboardingService.sendMobileOtp(targetValue, actionType, role);
      }
      // Store the actionType and role so the resend function knows what to do
      setOtpModal({ isOpen: true, type, targetValue, actionType, role });
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
      
      // Reset state on success
      setOtpModal({ isOpen: false, type: '', targetValue: '', actionType: 'register', role: 'seller' });
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
      // 🌟 Pass the saved actionType and role back to the service
      if (otpModal.type === 'email') {
        await onboardingService.sendEmailOtp(otpModal.targetValue, otpModal.actionType, otpModal.role || 'seller');
      } else {
        await onboardingService.sendMobileOtp(otpModal.targetValue, otpModal.actionType, otpModal.role || 'seller');
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const closeOtpModal = () => {
    setOtpModal({ isOpen: false, type: '', targetValue: '', actionType: 'register' });
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