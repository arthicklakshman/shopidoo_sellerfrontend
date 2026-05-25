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
import OtpModal from '../components/OtpModal';
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

// 🌟 UPDATED: Removed the confusing 'disabled' logic. Now it will show a helpful error if clicked while empty!
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
        mobileNumber: parsed?.mobileNumber || '',
        emailId: parsed?.emailId || '',
        password: '',
        confirmPassword: '',
        businessType: parsed?.businessType || ''
      };
    } catch (error) {
      console.error("Failed to parse onboarding_step_1", error);
      return {
        fullName: '', mobileNumber: '', emailId: '', password: '', confirmPassword: '', businessType: ''
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
    
    // Reset verification if they alter the field after verifying
    if (name === 'mobileNumber' && isMobileVerified) setIsMobileVerified(false);
    if (name === 'emailId' && isEmailVerified) setIsEmailVerified(false);
  };

 // 🌟 REAL BACKEND CALL: Send OTP
  const handleSendOtp = async (type) => {
    setOtpError('');
    if (type === 'mobile') {
      const err = validateMobile(formData.mobileNumber);
      if (err) return setErrors((prev) => ({ ...prev, mobileNumber: err }));
      
      try {
        // 🌟 Call the backend for Mobile!
        await onboardingService.sendMobileOtp(formData.mobileNumber);
        setOtpModal({ isOpen: true, type: 'mobile', targetValue: formData.mobileNumber });
      } catch (error) {
        setErrors((prev) => ({ ...prev, mobileNumber: 'Failed to send SMS.' }));
      }
      
    } else if (type === 'email') {
      const err = validateEmail(formData.emailId);
      if (err) return setErrors((prev) => ({ ...prev, emailId: err }));
      
      try {
        // 🌟 Call the real Node.js backend!
        await onboardingService.sendEmailOtp(formData.emailId);
        
        // Only open the modal if the email successfully sent
        setOtpModal({ isOpen: true, type: 'email', targetValue: formData.emailId });
      } catch (error) {
        setErrors((prev) => ({ 
          ...prev, 
          emailId: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
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
        
        if (otpModal.type === 'email') setIsEmailVerified(true);
        if (otpModal.type === 'mobile') setIsMobileVerified(true);
        
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

    if (otpModal.type === 'email') {
      try {
        // Call the exact same service function we used to send it the first time
        await onboardingService.sendEmailOtp(otpModal.targetValue);
        console.log("OTP successfully resent to:", otpModal.targetValue);
      } catch (error) {
        setOtpError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
      }
    } else if (otpModal.type === 'mobile') {
      // We will hook up the Brevo SMS logic here later!
      console.log(`Resending OTP to mobile:`, otpModal.targetValue);
    }
  };

  const handleContinue = async () => {
    const newErrors = {
      fullName: validateRequired(formData.fullName, 'Full Name'),
      mobileNumber: validateMobile(formData.mobileNumber),
      emailId: validateEmail(formData.emailId),
      password: validatePassword(formData.password),
      businessType: validateRequired(formData.businessType, 'Business Type')
    };

    if (!sellerId || formData.password) {
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
    } else {
        delete newErrors.password;
    }

    const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) acc[key] = value;
      return acc;
    }, {});

    if (Object.keys(actualErrors).length > 0) {
      setErrors(actualErrors);
      return; 
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
          mobileNumber: formData.mobileNumber,
          emailId: formData.emailId,
          businessType: formData.businessType,
          ...(formData.password && { password: formData.password })
        });
      } else {
        try {
          response = await onboardingService.registerBasicInfo({
            fullName: formData.fullName,
            mobileNumber: formData.mobileNumber,
            emailId: formData.emailId,
            password: formData.password,
            businessType: formData.businessType
          });
        } catch (regErr) {
          // If the user already exists (409 Conflict), try to log them in with the password they provided
          if (regErr.response?.status === 409) {
            try {
              const loginResp = await api.post('/auth/login', { 
                email: formData.emailId, 
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
                <StyledInputLabel required>Mobile Number</StyledInputLabel>
                <TextField fullWidth name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" variant="outlined" size="small" error={!!errors.mobileNumber} helperText={errors.mobileNumber} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      {/* 🌟 NOW ALWAYS CLICKABLE! */}
                      <VerifyButton 
                        onClick={() => handleSendOtp('mobile')} 
                        isVerified={isMobileVerified}
                      />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel required>Email ID</StyledInputLabel>
                <TextField fullWidth name="emailId" value={formData.emailId} onChange={handleInputChange} placeholder="your.email@example.com" variant="outlined" size="small" error={!!errors.emailId} helperText={errors.emailId} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      {/* 🌟 NOW ALWAYS CLICKABLE! */}
                      <VerifyButton 
                        onClick={() => handleSendOtp('email')} 
                        isVerified={isEmailVerified}
                      />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel required={!sellerId}>Password</StyledInputLabel>
                <TextField fullWidth name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? 'text' : 'password'} placeholder={sellerId ? "Leave blank to keep current password" : "Minimum 8 characters"} variant="outlined" size="small" error={!!errors.password} helperText={errors.password} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
              </Box>

              <Box>
                <StyledInputLabel required={!sellerId}>Confirm Password</StyledInputLabel>
                <TextField fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password" variant="outlined" size="small" error={!!errors.confirmPassword} helperText={errors.confirmPassword} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowConfirmPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>Business Type</InputLabel>
                  <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>
                  <HelpOutlineIcon sx={{ color: '#9ca3af', fontSize: 16, ml: 1 }} />
                </Box>
                <TextField select fullWidth name="businessType" value={formData.businessType} onChange={handleInputChange} variant="outlined" size="small" error={!!errors.businessType} sx={customInputStyles} SelectProps={{ displayEmpty: true, renderValue: (value) => { if (value === "") return <span style={{ color: '#9ca3af' }}>Select business type</span>; if (value === 'sole_proprietorship') return 'Sole Proprietorship'; if (value === 'partnership') return 'Partnership'; if (value === 'llc') return 'LLC'; if (value === 'corporation') return 'Corporation'; return value; } }} >
                  <MenuItem value="" disabled>Select business type</MenuItem>
                  <MenuItem value="sole_proprietorship">Sole Proprietorship</MenuItem>
                  <MenuItem value="partnership">Partnership</MenuItem>
                  <MenuItem value="llc">LLC</MenuItem>
                  <MenuItem value="corporation">Corporation</MenuItem>
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




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Box, Typography, Card, CardContent, Grid, TextField, Button,
//   InputAdornment, IconButton, MenuItem, InputLabel, FormHelperText
// } from '@mui/material';

// // Icons
// import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
// import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// // Import Validation Helpers
// import {
//   validateRequired, validateEmail, validateMobile, validatePassword
// } from '../../../utils/validation';

// import onboardingService from '../../../features/onboarding/onboarding.service';

// // 🌟 IMPORT NEW REUSABLE COMPONENTS (Adjust paths if needed)
// import StepWrapper from '../../../features/onboarding/components/StepWrapper'; 
// import NavigationButtons from '../../../features/onboarding/components/NavigationButtons'; 
// import GradientButton from '../../../components/shared/GradientButton/GradientButton';

// // Reusable styled label with the red asterisk
// const StyledInputLabel = ({ children, required }) => (
//   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//     <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>
//       {children}
//     </InputLabel>
//     {required && (
//       <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>
//         *
//       </Typography>
//     )}
//   </Box>
// );

// // Reusable custom input styles for the gray, borderless look
// const customInputStyles = {
//   backgroundColor: '#f3f4f6',
//   borderRadius: '8px',
//   '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
//   '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
//   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #3b82f6' },
//   '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' },
//   '& .MuiOutlinedInput-input': { padding: '12px 14px', fontSize: '14px', color: '#111827' }
// };

// // Reusable "Verify" button style inside inputs


// const VerifyButton = () => (
//   <GradientButton
//     sx={{
//       py: 0.6,               // Shrinks the vertical height to fit the input
//       px: 3,                 // Horizontal padding
//       borderRadius: '6px',   // Slightly smaller radius to match standard inputs
//       textTransform: 'none', // Keeps it saying "Verify" instead of "VERIFY" (optional)
//       fontSize: '0.875rem',  // Slightly smaller text
//       minWidth: 'auto',
//     }}
//   >
//     Verify
//   </GradientButton>
// );

// // 🌟 ADDED `sellerId` to props to detect if we are in "Edit" mode
// export default function BasicInformation({ onNext, sellerId }) {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleClickShowPassword = () => setShowPassword((show) => !show);
//   const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

//   // 1. Load from Local Storage on initial render
//   const [formData, setFormData] = useState(() => {
//     const savedData = localStorage.getItem('onboarding_step_1');
//     return savedData ? JSON.parse(savedData) : {
//       fullName: '', mobileNumber: '', emailId: '', password: '', confirmPassword: '', businessType: ''
//     };
//   });

//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState('');

//   // 2. Auto-save to Local Storage (Never delete this so Edit works!)
//   useEffect(() => {
//     localStorage.setItem('onboarding_step_1', JSON.stringify(formData));
//   }, [formData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
//     if (apiError) setApiError('');
//   };

//   // 3. Handle Form Submission
//   const handleContinue = async () => {
//     const newErrors = {
//       fullName: validateRequired(formData.fullName, 'Full Name'),
//       mobileNumber: validateMobile(formData.mobileNumber),
//       emailId: validateEmail(formData.emailId),
//       password: validatePassword(formData.password),
//       businessType: validateRequired(formData.businessType, 'Business Type')
//     };

//     if (!sellerId || formData.password) {
//         if (!formData.confirmPassword) {
//             newErrors.confirmPassword = 'Please confirm your password';
//         } else if (formData.password !== formData.confirmPassword) {
//             newErrors.confirmPassword = 'Passwords do not match';
//         }
//     } else {
//         delete newErrors.password;
//     }

//     const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
//       if (value !== null && value !== undefined) acc[key] = value;
//       return acc;
//     }, {});

//     if (Object.keys(actualErrors).length > 0) {
//       setErrors(actualErrors);
//       return; 
//     }

//     try {
//     setIsLoading(true);
//     setApiError('');

//     let currentSellerId = sellerId;

//     if (sellerId) {
//       // 🌟 NEW: Use service instead of direct axios.put
//       await onboardingService.updateBasicInfo(sellerId, {
//         fullName: formData.fullName,
//         mobileNumber: formData.mobileNumber,
//         emailId: formData.emailId,
//         businessType: formData.businessType,
//         ...(formData.password && { password: formData.password })
//       });
//     } else {
//       // 🌟 NEW: Use service instead of direct axios.post
//       const response = await onboardingService.registerBasicInfo({
//         fullName: formData.fullName,
//         mobileNumber: formData.mobileNumber,
//         emailId: formData.emailId,
//         password: formData.password,
//         businessType: formData.businessType
//       });
      
//       currentSellerId = response.data.data.id || response.data.data.sellerId;
//       localStorage.setItem("sellerId", currentSellerId);
//     }

//       const updatedStorageData = { ...formData, id: currentSellerId };
//       localStorage.setItem('onboarding_step_1', JSON.stringify(updatedStorageData));

//       // Move to next step with the ID
//      onNext(currentSellerId); 

// } catch (err) {
//   setApiError(err.response?.data?.message || 'Server connection failed.');
// } finally {
//   setIsLoading(false);
// }
//   };

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
//       <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">

//         {/* Left Column: Info Card */}
//         <Grid item xs={12} md={5}>
//           <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
//                 Quick & Secure Registration
//               </Typography>
//               <Box sx={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', mb: 4, backgroundColor: '#f3f4f6' }}>
//                 <img src="" alt="Mobile shopping" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               </Box>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                 {['Your data is encrypted and secure', 'OTP verification for security', 'Auto-save feature - never lose progress'].map((text, idx) => (
//                   <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                     <GppGoodOutlinedIcon sx={{ color: '#22c55e', fontSize: 22 }} />
//                     <Typography sx={{ color: '#4b5563', fontSize: '15px' }}>{text}</Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Right Column: Form Card */}
//         <Grid item xs={12} md={7}>
          
//           {/* 🌟 USED STEP WRAPPER HERE */}
//           <StepWrapper>
            
//             <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>
//               Basic Information
//             </Typography>

//             {apiError && (
//               <Typography sx={{ color: '#ef4444', fontSize: '14px', fontWeight: 600, mb: 3 }}>
//                 {apiError}
//               </Typography>
//             )}

//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* Full Name */}
//               <Box>
//                 <StyledInputLabel required>Full Name</StyledInputLabel>
//                 <TextField fullWidth name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" variant="outlined" size="small" error={!!errors.fullName} helperText={errors.fullName} sx={customInputStyles} />
//               </Box>

//               {/* Mobile Number */}
//               <Box>
//                 <StyledInputLabel required>Mobile Number</StyledInputLabel>
//                 <TextField fullWidth name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" variant="outlined" size="small" error={!!errors.mobileNumber} helperText={errors.mobileNumber} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} InputProps={{ endAdornment: ( <InputAdornment position="end"><VerifyButton /></InputAdornment> ), }} />
//               </Box>

//               {/* Email ID */}
//               <Box>
//                 <StyledInputLabel required>Email ID</StyledInputLabel>
//                 <TextField fullWidth name="emailId" value={formData.emailId} onChange={handleInputChange} placeholder="your.email@example.com" variant="outlined" size="small" error={!!errors.emailId} helperText={errors.emailId} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} InputProps={{ endAdornment: ( <InputAdornment position="end"><VerifyButton /></InputAdornment> ), }} />
//               </Box>

//               {/* Password (Optional in Edit Mode) */}
//               <Box>
//                 <StyledInputLabel required={!sellerId}>Password</StyledInputLabel>
//                 <TextField fullWidth name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? 'text' : 'password'} placeholder={sellerId ? "Leave blank to keep current password" : "Minimum 8 characters"} variant="outlined" size="small" error={!!errors.password} helperText={errors.password} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
//               </Box>

//               {/* Confirm Password */}
//               <Box>
//                 <StyledInputLabel required={!sellerId}>Confirm Password</StyledInputLabel>
//                 <TextField fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password" variant="outlined" size="small" error={!!errors.confirmPassword} helperText={errors.confirmPassword} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowConfirmPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
//               </Box>

//               {/* Business Type */}
//               <Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                   <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>Business Type</InputLabel>
//                   <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>
//                   <HelpOutlineIcon sx={{ color: '#9ca3af', fontSize: 16, ml: 1 }} />
//                 </Box>
//                 <TextField select fullWidth name="businessType" value={formData.businessType} onChange={handleInputChange} variant="outlined" size="small" error={!!errors.businessType} sx={customInputStyles} SelectProps={{ displayEmpty: true, renderValue: (value) => { if (value === "") return <span style={{ color: '#9ca3af' }}>Select business type</span>; if (value === 'sole_proprietorship') return 'Sole Proprietorship'; if (value === 'partnership') return 'Partnership'; if (value === 'llc') return 'LLC'; if (value === 'corporation') return 'Corporation'; return value; } }} >
//                   <MenuItem value="" disabled>Select business type</MenuItem>
//                   <MenuItem value="sole_proprietorship">Sole Proprietorship</MenuItem>
//                   <MenuItem value="partnership">Partnership</MenuItem>
//                   <MenuItem value="llc">LLC</MenuItem>
//                   <MenuItem value="corporation">Corporation</MenuItem>
//                 </TextField>
//                 {errors.businessType && <FormHelperText error sx={{ ml: 1.5 }}>{errors.businessType}</FormHelperText>}
//               </Box>

//             </Box>

//             {/* 🌟 USED NAVIGATION BUTTONS HERE */}
//             <NavigationButtons 
            
//               onContinue={handleContinue} 
//               isLoading={isLoading} 
//               isLastStep={false} 
//             />

//           </StepWrapper>

//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
