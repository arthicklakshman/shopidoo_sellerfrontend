import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  InputAdornment, IconButton, MenuItem, InputLabel, FormHelperText
} from '@mui/material';

// Icons
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import Validation Helpers
import {
  validateRequired, validateEmail, validateMobile, validatePassword
} from '../../../utils/validation';

import onboardingService from '../onboarding.service';

// Reusable Components
import { setSellerId } from '../onboardingSlice';
import { setCredentials } from '../../auth/authSlice'; 
import StepWrapper from '../components/StepWrapper'; 
import NavigationButtons from '../components/NavigationButtons'; 
import GradientButton from '../../../components/shared/GradientButton/GradientButton';
import OtpModal from '../../../components/shared/OtpModal/OtpModal';
import onboardingOne from '../../../assets/onboarding_one.jpg';

const StyledInputLabel = ({ children, required }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{children}</InputLabel>
    {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>}
  </Box>
);

const customInputStyles = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #3b82f6' },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' },
  '& .MuiOutlinedInput-input': { padding: '12px 14px', fontSize: '14px', color: '#111827' }
};

const VerifyButton = ({ onClick, isVerified }) => (
  <GradientButton
    type="button" // 👈 Prevents accidental form submissions
    onClick={onClick}
    disabled={isVerified}
    sx={{
      py: 0.6, px: 3, borderRadius: '6px', textTransform: 'none', fontSize: '0.875rem', minWidth: 'auto',
      ...(isVerified && {
        background: '#ecfdf5', color: '#059669', boxShadow: 'none',
        '&:hover': { background: '#ecfdf5', boxShadow: 'none' },
        '&.Mui-disabled': { background: '#ecfdf5', color: '#059669', WebkitTextFillColor: '#059669' } 
      })
    }}
  >
    {isVerified ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{ fontSize: 16 }} /> Verified</Box> : 'Verify'}
  </GradientButton>
);

export default function BasicInformation({ onNext, sellerId }) {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const [formData, setFormData] = useState(() => {
    try {
      const savedData = localStorage.getItem('onboarding_step_1');
      const parsed = savedData ? JSON.parse(savedData) : null;
      return {
        fullName: parsed?.fullName || '',
        phone: parsed?.phone || '',
        email: parsed?.email || '',
        password: '',
        confirmPassword: '',
        businessType: parsed?.businessType || '',
        email_verified: parsed?.email_verified || 0,
        phone_verified: parsed?.phone_verified || 0,
        verifiedEmailValue: parsed?.verifiedEmailValue || '',
        verifiedPhoneValue: parsed?.verifiedPhoneValue || '',
        isRegistered: parsed?.isRegistered ?? null
      };
    } catch (error) {
      console.error("Failed to parse onboarding_step_1", error);
      return {
        fullName: '', phone: '', email: '', password: '', confirmPassword: '', businessType: '', email_verified: 0, phone_verified: 0, verifiedEmailValue: '', verifiedPhoneValue: '', isRegistered: null
      };
    }
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 🌟 UNIFIED OTP STATE
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', targetValue: '' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    localStorage.setItem('onboarding_step_1', JSON.stringify(formData));
  }, [formData]);

  // 🌟 NEW: Dynamic DB verification checks on type
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@')) {
        try {
          const response = await onboardingService.checkExists({ email: formData.email, role: 'seller' });
          if (response?.data?.data?.exists) {
             const { email_verified, isRegistered } = response.data.data;
             setFormData(prev => ({ ...prev, isRegistered }));
             if (email_verified) {
               setFormData(prev => ({ ...prev, email_verified: 1, verifiedEmailValue: formData.email }));
               setIsEmailVerified(true);
             }
          }
        } catch (e) { console.error('Check exists failed:', e); }
      }
    };
    const delayDebounceFn = setTimeout(() => { checkEmail(); }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.email]);

  useEffect(() => {
    const checkPhone = async () => {
      if (formData.phone && formData.phone.length >= 10) {
        try {
          const response = await onboardingService.checkExists({ phone: formData.phone, role: 'seller' });
          if (response?.data?.data?.exists) {
             const { phone_verified, isRegistered } = response.data.data;
             setFormData(prev => ({ ...prev, isRegistered }));
             if (phone_verified) {
               setFormData(prev => ({ ...prev, phone_verified: 1, verifiedPhoneValue: formData.phone }));
               setIsMobileVerified(true);
             }
          }
        } catch (e) { console.error('Check exists failed:', e); }
      }
    };
    const delayDebounceFn = setTimeout(() => { checkPhone(); }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
    
    // Reset verification if they alter the field after verifying
    if (name === 'phone' && isMobileVerified) setIsMobileVerified(false);
    if (name === 'email' && isEmailVerified) setIsEmailVerified(false);
  };


const handleSendOtp = async (type) => {
    setOtpError('');
    if (type === 'mobile') {
      const err = validateMobile(formData.phone);
      if (err) return setErrors((prev) => ({ ...prev, phone: err }));
      
      try {
        // 🌟 Passing the 'register' type to ensure the correct MSG91 DLT Template triggers
        await onboardingService.sendMobileOtp(formData.phone, 'register');
        setOtpModal({ isOpen: true, type: 'mobile', targetValue: formData.phone });
      } catch (error) {
        setErrors((prev) => ({ 
          ...prev, 
          phone: error.response?.data?.message || 'Failed to send SMS.' 
        }));
      }
      
    } else if (type === 'email') {
      const err = validateEmail(formData.email);
      if (err) return setErrors((prev) => ({ ...prev, email: err }));
      
      try {
        // 🌟 Passing the 'register' type here as well (even though email currently ignores it, it's good practice)
        await onboardingService.sendEmailOtp(formData.email, 'register');
        
        // Only open the modal if the email successfully sent
        setOtpModal({ isOpen: true, type: 'email', targetValue: formData.email });
      } catch (error) {
        setErrors((prev) => ({ 
          ...prev, 
          email: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
        }));
      }
    }
  };

  // 🌟 REAL BACKEND CALL: Verify OTP
  const handleVerifyOtp = async (otpValue) => {
    setOtpLoading(true);
    setOtpError('');

    try {
      if (otpModal.type === 'email' || otpModal.type === 'mobile') {
        // 🌟 Call the real Node.js backend for both Email and Mobile!
        await onboardingService.verifyEmailOtp(otpModal.targetValue, otpValue);
        
        if (otpModal.type === 'email') {
          setIsEmailVerified(true);
          setFormData(prev => ({ ...prev, email_verified: 1, verifiedEmailValue: otpModal.targetValue }));
        }
        if (otpModal.type === 'mobile') {
          setIsMobileVerified(true);
          setFormData(prev => ({ ...prev, phone_verified: 1, verifiedPhoneValue: otpModal.targetValue }));
        }
        
        setOtpModal({ isOpen: false, type: '', targetValue: '' });
      }
    } catch (error) {
      // If the backend says the code is wrong or expired, show the red error in the modal
      setOtpError(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(''); // Clear any previous errors

    try {
      if (otpModal.type === 'email') {
        // 🌟 Resend via Email, ensuring the 'register' type is passed again
        await onboardingService.sendEmailOtp(otpModal.targetValue, 'register');
        console.log("OTP successfully resent to email:", otpModal.targetValue);
        
      } else if (otpModal.type === 'mobile') {
        // 🌟 Hooked up the Mobile SMS Resend Logic using MSG91!
        await onboardingService.sendMobileOtp(otpModal.targetValue, 'register');
        console.log("OTP successfully resent to mobile:", otpModal.targetValue);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleContinue = async () => {
    const newErrors = {
      fullName: validateRequired(formData.fullName, 'Full Name'),
      phone: validateMobile(formData.phone),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      businessType: validateRequired(formData.businessType, 'Business Type')
    };

    const currentPhoneVerified = isMobileVerified || (formData.phone_verified === 1 && formData.phone === formData.verifiedPhoneValue);
    const currentEmailVerified = isEmailVerified || (formData.email_verified === 1 && formData.email === formData.verifiedEmailValue);

    // 🚨 NEW BLOCK: Enforce OTP Verification before allowing registration
    if (!sellerId) { 
      // Only force verification on initial registration, not on profile updates
      if (!currentPhoneVerified && !newErrors.phone) {
        newErrors.phone = 'You must verify your phone number to continue.';
      }
      if (!currentEmailVerified && !newErrors.email) {
        newErrors.email = 'You must verify your email address to continue.';
      }
    } else {
      // If updating, only force verification if they altered the original values
      // (Since handleInputChange resets isMobileVerified to false when typing)
      if (!currentPhoneVerified && formData.phone !== JSON.parse(localStorage.getItem('onboarding_step_1'))?.phone) {
        newErrors.phone = 'You must verify your new phone number.';
      }
      if (!currentEmailVerified && formData.email !== JSON.parse(localStorage.getItem('onboarding_step_1'))?.email) {
        newErrors.email = 'You must verify your new email address.';
      }
    }

    const isResumingOnboarding = !sellerId && currentPhoneVerified && currentEmailVerified && formData.isRegistered === false;

    if (!isResumingOnboarding && (!sellerId || formData.password)) {
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
    } else {
        delete newErrors.password;
        delete newErrors.confirmPassword;
    }

    const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) acc[key] = value;
      return acc;
    }, {});

    if (Object.keys(actualErrors).length > 0) {
      setErrors(actualErrors);
      return; // Stops the function if anything is unverified or invalid
    }

    try {
      setIsLoading(true);
      setApiError('');

      let response;
      const hasToken = !!localStorage.getItem('sellerAccessToken');

      // If we have a sellerId AND a token, we can perform an update.
      // Otherwise, we MUST treat it as a registration to get fresh tokens.
      if (sellerId && hasToken) {
        response = await onboardingService.updateBasicInfo(sellerId, {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          businessType: formData.businessType,
          email_verified: formData.email_verified,
          phone_verified: formData.phone_verified,
          ...(formData.password && { password: formData.password })
        });
      } else if (isResumingOnboarding) {
        // New Feature: Bypass password and fetch token if they exist but haven't finished onboarding
        response = await onboardingService.resumeOnboarding(formData.email);
      } else {
        try {
          response = await onboardingService.registerBasicInfo({
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            businessType: formData.businessType,
            email_verified: formData.email_verified,
            phone_verified: formData.phone_verified
          });
        } catch (regErr) {
          // If the user already exists (409 Conflict), try to log them in with the password they provided
          if (regErr.response?.status === 409) {
            try {
              const loginResp = await api.post('/auth/login', { 
                email: formData.email, 
                password: formData.password,
                role: 'seller'
              });
              response = loginResp;
            } catch (loginErr) {
              // If login also fails, throw the original registration error or a custom one
              throw new Error("This email is already registered. Please check your password or use the Login page.");
            }
          } else {
            throw regErr;
          }
        }
      }

      const respData = response?.data?.data || response?.data;
      const userData = respData?.user;
      const accessToken = respData?.accessToken || respData?.token;
      const refreshToken = respData?.refreshToken;

      // If we got tokens (from registration or login), sync them
      if (userData && accessToken) {
        const currentSellerId = userData.id || userData.sellerId;

        // Persist to LocalStorage
        localStorage.setItem("sellerId", currentSellerId);
        localStorage.setItem("sellerAccessToken", accessToken);
        localStorage.setItem("sellerRefreshToken", refreshToken || '');
        localStorage.setItem("sellerUser", JSON.stringify(userData));
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Sync Redux State
        if (dispatch) {
          dispatch(setSellerId(currentSellerId));
          dispatch(setCredentials({
            user: { ...userData, role: userData.role || 'seller' },
            token: accessToken
          }));
        }

        // 🌟 FETCH FULL PROFILE TO PREPOPULATE ONBOARDING STEPS
        try {
          // We need to pass the newly obtained token in the header manually if the api client hasn't caught it yet
          const profileResponse = await onboardingService.getProfile({
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          const fullUser = profileResponse?.data?.data || profileResponse?.data;
          if (fullUser) {
            // Map Step 2: Business Details
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
              state: fullUser.state || ''
            };
            localStorage.setItem("onboarding_step_2", JSON.stringify(step2));

            // Map Step 3: Bank Details
            const step3 = {
              accountName: fullUser.accountName || '',
              accountNumber: fullUser.accountNumber || '',
              confirmAccountNumber: fullUser.accountNumber || '', // Pre-fill confirmation if it exists
              ifscCode: fullUser.ifscCode || ''
            };
            localStorage.setItem("onboarding_step_3", JSON.stringify(step3));

            // Map Step 4: Documents (This component actually reads from onboarding_step_5)
            const step5 = {
              gstProof: fullUser.gstProofImage ? { name: 'Uploaded GST Proof' } : null,
              panCard: fullUser.panCardImage ? { name: 'Uploaded PAN Card' } : null,
              aadhaarFront: fullUser.aadhaarFrontImage ? { name: 'Uploaded Aadhaar Front' } : null,
              aadhaarBack: fullUser.aadhaarBackImage ? { name: 'Uploaded Aadhaar Back' } : null,
              signature: fullUser.signatureImage ? { name: 'Uploaded Signature' } : null,
              businessProof: fullUser.businessProofImage ? { name: 'Uploaded Business Proof' } : null,
              bankProof: fullUser.bankProofImage ? { name: 'Uploaded Bank Proof' } : null
            };
            localStorage.setItem("onboarding_step_5", JSON.stringify(step5));

            let categoriesArray = [];
            try {
              if (fullUser.categories) {
                categoriesArray = typeof fullUser.categories === 'string' ? JSON.parse(fullUser.categories) : fullUser.categories;
              }
            } catch (e) {
              console.error(e);
            }

            // Map Step 5: Store Setup (This component actually reads from onboarding_step_6)
            const step6 = {
              storeLogo: fullUser.storeLogo ? { name: 'Uploaded Store Logo' } : null,
              storeBanner: fullUser.storeBanner ? { name: 'Uploaded Store Banner' } : null,
              selectedCategories: categoriesArray,
              shippingPreference: fullUser.shippingPreference || 'platform',
              pickupAddress: fullUser.pickupAddress || '',
              sameAsBusinessAddress: !fullUser.pickupAddress
            };
            localStorage.setItem("onboarding_step_6", JSON.stringify(step6));
          }
        } catch (profileErr) {
          console.error("Failed to fetch full profile for prepopulation", profileErr);
        }
        
        onNext(currentSellerId);
      } else {
        // If it was just an update and no new tokens were returned, 
        // we assume the existing session is still valid.
        onNext(sellerId);
      }

    } catch (err) {
      setApiError(err.response?.data?.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Quick & Secure Registration</Typography>
              <Box sx={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', mb: 4, backgroundColor: '#f3f4f6' }}>
                <img src={onboardingOne} alt="Quick & Secure Registration" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Your data is encrypted and secure', 'OTP verification for security', 'Auto-save feature - never lose progress'].map((text, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GppGoodOutlinedIcon sx={{ color: '#22c55e', fontSize: 22 }} />
                    <Typography sx={{ color: '#4b5563', fontSize: '15px' }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <StepWrapper>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>Basic Information</Typography>
            {apiError && <Typography sx={{ color: '#ef4444', fontSize: '14px', fontWeight: 600, mb: 3 }}>{apiError}</Typography>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Box>
                <StyledInputLabel required>Full Name</StyledInputLabel>
                <TextField fullWidth name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" variant="outlined" size="small" error={!!errors.fullName} helperText={errors.fullName} sx={customInputStyles} />
              </Box>

              <Box>
                <StyledInputLabel required>Phone</StyledInputLabel>
                <TextField fullWidth name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit Phone" variant="outlined" size="small" error={!!errors.phone} helperText={errors.phone} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      {(isMobileVerified || (formData.phone_verified === 1 && formData.phone === formData.verifiedPhoneValue)) ? (
                        <Typography sx={{ color: '#059669', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16 }} /> Number verified
                        </Typography>
                      ) : (
                        <VerifyButton 
                          onClick={() => handleSendOtp('mobile')} 
                          isVerified={false}
                        />
                      )}
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel required>Email</StyledInputLabel>
                <TextField fullWidth name="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" variant="outlined" size="small" error={!!errors.email} helperText={errors.email} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      {(isEmailVerified || (formData.email_verified === 1 && formData.email === formData.verifiedEmailValue)) ? (
                        <Typography sx={{ color: '#059669', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16 }} /> Email verified
                        </Typography>
                      ) : (
                        <VerifyButton 
                          onClick={() => handleSendOtp('email')} 
                          isVerified={false}
                        />
                      )}
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              {!(isEmailVerified || (formData.email_verified === 1 && formData.email === formData.verifiedEmailValue)) || !(isMobileVerified || (formData.phone_verified === 1 && formData.phone === formData.verifiedPhoneValue)) || formData.isRegistered !== false ? (
                <>
                  <Box>
                    <StyledInputLabel required={!sellerId}>Password</StyledInputLabel>
                    <TextField fullWidth name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? 'text' : 'password'} placeholder={sellerId ? "Leave blank to keep current password" : "Minimum 8 characters"} variant="outlined" size="small" error={!!errors.password} helperText={errors.password} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
                  </Box>

                  <Box>
                    <StyledInputLabel required={!sellerId}>Confirm Password</StyledInputLabel>
                    <TextField fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password" variant="outlined" size="small" error={!!errors.confirmPassword} helperText={errors.confirmPassword} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowConfirmPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
                  </Box>
                </>
              ) : null}

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>Business Type</InputLabel>
                  <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>
                  <HelpOutlineIcon sx={{ color: '#9ca3af', fontSize: 16, ml: 1 }} />
                </Box>
                <TextField select fullWidth name="businessType" value={formData.businessType} onChange={handleInputChange} variant="outlined" size="small" error={!!errors.businessType} sx={customInputStyles} SelectProps={{ displayEmpty: true, MenuProps: { disableScrollLock: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' }, transformOrigin: { vertical: 'top', horizontal: 'left' }, PaperProps: { sx: { mt: 0.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }, renderValue: (value) => { if (value === "") return <span style={{ color: '#9ca3af' }}>Select business type</span>; if (value === 'manufacturing') return 'Manufacturing'; if (value === 'reseller_retailer') return 'Reseller / Retailer'; return value; } }} >
                  <MenuItem value="" disabled>Select business type</MenuItem>
                  <MenuItem value="manufacturing">Manufacturing</MenuItem>
                  <MenuItem value="reseller_retailer">Reseller / Retailer</MenuItem>
                </TextField>
                {errors.businessType && <FormHelperText error sx={{ ml: 1.5 }}>{errors.businessType}</FormHelperText>}
              </Box>
            </Box>

            <NavigationButtons onContinue={handleContinue} isLoading={isLoading} isLastStep={false} />
          </StepWrapper>
        </Grid>
      </Grid>

      <OtpModal
        open={otpModal.isOpen}
        onClose={() => setOtpModal({ isOpen: false, type: '', targetValue: '' })}
        targetValue={otpModal.targetValue} 
        type={otpModal.type}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        isLoading={otpLoading}
        error={otpError}
      />

    </Box>
  );
}



