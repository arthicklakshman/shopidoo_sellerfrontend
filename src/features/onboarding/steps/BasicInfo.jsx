import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  Box, Typography, Card, CardContent, Grid, TextField, 
  InputAdornment, IconButton, MenuItem, FormHelperText, InputLabel 
} from '@mui/material';

// Icons
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

//images
import basicinfoimg from '../../../assets/sellerregisterationfirstpage.jpg';


// Helpers & Hooks
import { validateRequired, validateEmail, validateMobile, validatePassword } from '../../../utils/validation';
import onboardingService from '../../../features/onboarding/onboarding.service';
import StepWrapper from '../../../features/onboarding/components/StepWrapper'; 
import NavigationButtons from '../../../features/onboarding/components/NavigationButtons'; 
import OtpModal from '../../../components/shared/OtpModal/OtpModal';
import GradientButton from '../../../components/shared/GradientButton/GradientButton';
import { useOtp } from '../../../utils/useOtp';

// Redux Actions
import { setSellerId } from '../onboardingSlice'; 
import { setCredentials } from '../../auth/authSlice'; 

const StyledInputLabel = ({ children, required }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
    <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{children}</InputLabel>
    {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>}
  </Box>
);

const customInputStyles = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  '& input::-ms-reveal': { display: 'none' }, // Hides Edge icon
  '& input::-ms-clear': { display: 'none' },  // Hides Edge clear icon
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #3b82f6' },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' },
  '& .MuiOutlinedInput-input': { padding: '12px 14px', fontSize: '14px', color: '#111827' }
};

const VerifyButton = ({ onClick, isVerified }) => (
  <GradientButton
    type="button"
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
    {isVerified ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleIcon sx={{ fontSize: 16 }} /> Verified
      </Box>
    ) : 'Verify'}
  </GradientButton>
);

export default function BasicInformation({ onNext, sellerId }) {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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
      return { fullName: '', mobileNumber: '', emailId: '', password: '', confirmPassword: '', businessType: '' };
    }
  });

  const { 
    otpModal, otpLoading, otpError, isMobileVerified, isEmailVerified, 
    sendOtp, verifyOtp, resendOtp, closeOtpModal, resetVerification 
  } = useOtp();

  useEffect(() => {
    localStorage.setItem('onboarding_step_1', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
    
    if (name === 'mobileNumber' && isMobileVerified) resetVerification('mobile');
    if (name === 'emailId' && isEmailVerified) resetVerification('email');
  };

  const handleSendOtpClick = async (type) => {
    if (type === 'mobile') {
      const err = validateMobile(formData.mobileNumber);
      if (err) return setErrors((prev) => ({ ...prev, mobileNumber: err }));
      try { await sendOtp('mobile', formData.mobileNumber); } 
      catch (error) { setErrors((prev) => ({ ...prev, mobileNumber: error.message })); }
    } else if (type === 'email') {
      const err = validateEmail(formData.emailId);
      if (err) return setErrors((prev) => ({ ...prev, emailId: err }));
      try { await sendOtp('email', formData.emailId); } 
      catch (error) { setErrors((prev) => ({ ...prev, emailId: error.message })); }
    }
  };

  const handleContinue = async () => {
    // 🌟 1. SECURITY CHECK: Ensure OTP is verified before proceeding (for new registrations)
    if (!sellerId) {
      if (!isEmailVerified) {
        setErrors((prev) => ({ ...prev, emailId: 'Please verify your email address before continuing.' }));
        return;
      }
      if (!isMobileVerified) {
        setErrors((prev) => ({ ...prev, mobileNumber: 'Please verify your mobile number before continuing.' }));
        return;
      }
    }

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
      delete newErrors.password; // Allow empty password on update
    }

    const actualErrors = Object.entries(newErrors).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
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
      let currentSellerId = sellerId;
      const hasToken = !!localStorage.getItem('sellerAccessToken');

      // 🌟 2. HANDLE UPDATE OR REGISTRATION
      if (sellerId && hasToken) {
        response = await onboardingService.updateBasicInfo(sellerId, {
          ...formData, ...(formData.password && { password: formData.password })
        });
      } else {
        try {
          response = await onboardingService.registerBasicInfo(formData);
        } catch (regErr) {
          // 🌟 3. SMART 409 AUTO-LOGIN: If email exists, attempt to log them in securely
          if (regErr.response?.status === 409) {
            try {
              response = await axios.post('http://localhost:5001/api/v1/auth/login', { 
                email: formData.emailId, 
                password: formData.password,
                role: 'seller'
              });
            } catch (loginErr) {
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

      // 🌟 4. SYNC TOKENS TO REDUX & LOCALSTORAGE
      if (userData && accessToken) {
        currentSellerId = userData.id || userData.sellerId;

        localStorage.setItem("sellerId", currentSellerId);
        localStorage.setItem("sellerAccessToken", accessToken);
        localStorage.setItem("sellerRefreshToken", refreshToken || '');
        localStorage.setItem("sellerUser", JSON.stringify(userData));
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch(setSellerId(currentSellerId));
        dispatch(setCredentials({
          user: { ...userData, role: userData.role || 'seller' },
          token: accessToken
        }));
        
        onNext(currentSellerId);
      } else {
        // Just an update, tokens are still valid
        onNext(sellerId);
      }

    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">
        <Grid item xs={12} md={5}>
  <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', height: '100%' }}>
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Quick & Secure Registration
      </Typography>

      {/* 🌟 Updated: Placeholder Box replaced with the imported image */}
      <Box
        component="img"
        src={basicinfoimg}
        alt="Seller Registration"
        sx={{
          width: '100%',
          height: '220px',
          borderRadius: '12px',
          mb: 4,
          objectFit: 'cover', // This ensures the image fills the area without being distorted
          display: 'block'
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {['Your data is encrypted and secure', 'OTP verification for security', 'Auto-save feature'].map((text, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <GppGoodOutlinedIcon sx={{ color: '#22c55e' }} />
            <Typography sx={{ color: '#4b5563' }}>{text}</Typography>
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
</Grid>

        <Grid item xs={12} md={7}>
          <StepWrapper>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Basic Information</Typography>
            {apiError && <Typography sx={{ color: '#ef4444', mb: 3 }}>{apiError}</Typography>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <StyledInputLabel required>Full Name</StyledInputLabel>
                <TextField fullWidth name="fullName" value={formData.fullName} onChange={handleInputChange} sx={customInputStyles} error={!!errors.fullName} helperText={errors.fullName} size="small" />
              </Box>

              <Box>
                <StyledInputLabel required>Mobile Number</StyledInputLabel>
                <TextField 
                  fullWidth name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} 
                  sx={customInputStyles} error={!!errors.mobileNumber} helperText={errors.mobileNumber} size="small"
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      <VerifyButton onClick={() => handleSendOtpClick('mobile')} isVerified={isMobileVerified} />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel required>Email ID</StyledInputLabel>
                <TextField 
                  fullWidth name="emailId" value={formData.emailId} onChange={handleInputChange} 
                  sx={customInputStyles} error={!!errors.emailId} helperText={errors.emailId} size="small"
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      <VerifyButton onClick={() => handleSendOtpClick('email')} isVerified={isEmailVerified} />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel required={!sellerId}>Password</StyledInputLabel>
                <TextField 
                  fullWidth name="password" value={formData.password} onChange={handleInputChange} 
                  type={showPassword ? 'text' : 'password'} sx={customInputStyles} error={!!errors.password} helperText={errors.password} size="small"
                  InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword}>
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  )}}
                />
              </Box>

              <Box>
                <StyledInputLabel required={!sellerId}>Confirm Password</StyledInputLabel>
                <TextField 
                  fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} 
                  type={showConfirmPassword ? 'text' : 'password'} sx={customInputStyles} error={!!errors.confirmPassword} helperText={errors.confirmPassword} size="small"
                  InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowConfirmPassword}>
                        {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  )}}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>Business Type</InputLabel>
                  <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>
                  <HelpOutlineIcon sx={{ color: '#9ca3af', fontSize: 16, ml: 1 }} />
                </Box>
                <TextField select fullWidth name="businessType" value={formData.businessType} onChange={handleInputChange} sx={customInputStyles} error={!!errors.businessType} size="small">
                  <MenuItem value="sole_proprietorship">Sole Proprietorship</MenuItem>
                  <MenuItem value="partnership">Partnership</MenuItem>
                  <MenuItem value="llc">LLC</MenuItem>
                </TextField>
                {errors.businessType && <FormHelperText error>{errors.businessType}</FormHelperText>}
              </Box>
            </Box>

            <NavigationButtons onContinue={handleContinue} isLoading={isLoading} isLastStep={false} />
          </StepWrapper>
        </Grid>
      </Grid>

      <OtpModal
        open={otpModal.isOpen}
        onClose={closeOtpModal}
        targetValue={otpModal.targetValue} 
        type={otpModal.type}
        onVerify={verifyOtp}
        onResend={resendOtp}
        isLoading={otpLoading}
        error={otpError}
      />
    </Box>
  );
}








// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   Box, Typography, Card, CardContent, Grid, TextField, Button,
//   InputAdornment, IconButton, MenuItem, InputLabel, FormHelperText
// } from '@mui/material';

// // Icons
// import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
// import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
// import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// // Import Validation Helpers
// import {
//   validateRequired, validateEmail, validateMobile, validatePassword
// } from '../../../utils/validation';

// import onboardingService from '../onboarding.service';

// // Reusable Components
// import { setSellerId } from '../onboardingSlice';
// import { setCredentials } from '../../auth/authSlice'; 
// import StepWrapper from '../components/StepWrapper'; 
// import NavigationButtons from '../components/NavigationButtons'; 
// import GradientButton from '../../../components/shared/GradientButton/GradientButton';
// import OtpModal from '../components/OtpModal';

// const StyledInputLabel = ({ children, required }) => (
//   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//     <InputLabel sx={{ color: '#111827', fontSize: '14px', fontWeight: 600 }}>{children}</InputLabel>
//     {required && <Typography sx={{ color: '#ef4444', ml: 0.5, fontSize: '14px', fontWeight: 600 }}>*</Typography>}
//   </Box>
// );

// const customInputStyles = {
//   backgroundColor: '#f3f4f6',
//   borderRadius: '8px',
//   '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
//   '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
//   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #3b82f6' },
//   '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' },
//   '& .MuiOutlinedInput-input': { padding: '12px 14px', fontSize: '14px', color: '#111827' }
// };

// // 🌟 UPDATED: Removed the confusing 'disabled' logic. Now it will show a helpful error if clicked while empty!
// const VerifyButton = ({ onClick, isVerified }) => (
//   <GradientButton
//     type="button" // 👈 Prevents accidental form submissions
//     onClick={onClick}
//     disabled={isVerified}
//     sx={{
//       py: 0.6, px: 3, borderRadius: '6px', textTransform: 'none', fontSize: '0.875rem', minWidth: 'auto',
//       ...(isVerified && {
//         background: '#ecfdf5', color: '#059669', boxShadow: 'none',
//         '&:hover': { background: '#ecfdf5', boxShadow: 'none' },
//         '&.Mui-disabled': { background: '#ecfdf5', color: '#059669', WebkitTextFillColor: '#059669' } 
//       })
//     }}
//   >
//     {isVerified ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{ fontSize: 16 }} /> Verified</Box> : 'Verify'}
//   </GradientButton>
// );

// export default function BasicInformation({ onNext, sellerId }) {
//   const dispatch = useDispatch();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleClickShowPassword = () => setShowPassword((show) => !show);
//   const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

//   const [formData, setFormData] = useState(() => {
//     try {
//       const savedData = localStorage.getItem('onboarding_step_1');
//       const parsed = savedData ? JSON.parse(savedData) : null;
//       return {
//         fullName: parsed?.fullName || '',
//         mobileNumber: parsed?.mobileNumber || '',
//         emailId: parsed?.emailId || '',
//         password: '',
//         confirmPassword: '',
//         businessType: parsed?.businessType || ''
//       };
//     } catch (error) {
//       console.error("Failed to parse onboarding_step_1", error);
//       return {
//         fullName: '', mobileNumber: '', emailId: '', password: '', confirmPassword: '', businessType: ''
//       };
//     }
//   });

//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState('');

//   // 🌟 UNIFIED OTP STATE
//   const [isMobileVerified, setIsMobileVerified] = useState(false);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [otpModal, setOtpModal] = useState({ isOpen: false, type: '', targetValue: '' });
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState('');

//   useEffect(() => {
//     localStorage.setItem('onboarding_step_1', JSON.stringify(formData));
//   }, [formData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
//     if (apiError) setApiError('');
    
//     // Reset verification if they alter the field after verifying
//     if (name === 'mobileNumber' && isMobileVerified) setIsMobileVerified(false);
//     if (name === 'emailId' && isEmailVerified) setIsEmailVerified(false);
//   };

//  // 🌟 REAL BACKEND CALL: Send OTP
//   const handleSendOtp = async (type) => {
//     setOtpError('');
//     if (type === 'mobile') {
//       const err = validateMobile(formData.mobileNumber);
//       if (err) return setErrors((prev) => ({ ...prev, mobileNumber: err }));
      
//       try {
//         // 🌟 Call the backend for Mobile!
//         await onboardingService.sendMobileOtp(formData.mobileNumber);
//         setOtpModal({ isOpen: true, type: 'mobile', targetValue: formData.mobileNumber });
//       } catch (error) {
//         setErrors((prev) => ({ ...prev, mobileNumber: 'Failed to send SMS.' }));
//       }
      
//     } else if (type === 'email') {
//       const err = validateEmail(formData.emailId);
//       if (err) return setErrors((prev) => ({ ...prev, emailId: err }));
      
//       try {
//         // 🌟 Call the real Node.js backend!
//         await onboardingService.sendEmailOtp(formData.emailId);
        
//         // Only open the modal if the email successfully sent
//         setOtpModal({ isOpen: true, type: 'email', targetValue: formData.emailId });
//       } catch (error) {
//         setErrors((prev) => ({ 
//           ...prev, 
//           emailId: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
//         }));
//       }
//     }
//   };
// // 🌟 REAL BACKEND CALL: Verify OTP
//   const handleVerifyOtp = async (otpValue) => {
//     setOtpLoading(true);
//     setOtpError('');

//     try {
//       if (otpModal.type === 'email') {
//         // 🌟 Call the real Node.js backend!
//         await onboardingService.verifyEmailOtp(otpModal.targetValue, otpValue);
        
//         // If it doesn't throw an error, it was successful!
//         setIsEmailVerified(true);
//         setOtpModal({ isOpen: false, type: '', targetValue: '' });

//       } else if (otpModal.type === 'mobile') {
//         // Mobile is still using the fake "123456" logic for now
//         if (otpValue === "123456") { 
//           setIsMobileVerified(true);
//           setOtpModal({ isOpen: false, type: '', targetValue: '' });
//         } else {
//           setOtpError("Invalid code. Please try again. (Hint: use 123456)");
//         }
//       }
//     } catch (error) {
//       // If the backend says the code is wrong or expired, show the red error in the modal
//       setOtpError(error.response?.data?.message || "Invalid or expired OTP.");
//     } finally {
//       setOtpLoading(false);
//     }
//   };
// const handleResendOtp = async () => {
//     setOtpError(''); // Clear any previous errors

//     if (otpModal.type === 'email') {
//       try {
//         // Call the exact same service function we used to send it the first time
//         await onboardingService.sendEmailOtp(otpModal.targetValue);
//         console.log("OTP successfully resent to:", otpModal.targetValue);
//       } catch (error) {
//         setOtpError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
//       }
//     } else if (otpModal.type === 'mobile') {
//       // We will hook up the Brevo SMS logic here later!
//       console.log(`Resending OTP to mobile:`, otpModal.targetValue);
//     }
//   };

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
//       setIsLoading(true);
//       setApiError('');

//       let response;
//       const hasToken = !!localStorage.getItem('sellerAccessToken');

//       // If we have a sellerId AND a token, we can perform an update.
//       // Otherwise, we MUST treat it as a registration to get fresh tokens.
//       if (sellerId && hasToken) {
//         response = await onboardingService.updateBasicInfo(sellerId, {
//           fullName: formData.fullName,
//           mobileNumber: formData.mobileNumber,
//           emailId: formData.emailId,
//           businessType: formData.businessType,
//           ...(formData.password && { password: formData.password })
//         });
//       } else {
//         try {
//           response = await onboardingService.registerBasicInfo({
//             fullName: formData.fullName,
//             mobileNumber: formData.mobileNumber,
//             emailId: formData.emailId,
//             password: formData.password,
//             businessType: formData.businessType
//           });
//         } catch (regErr) {
//           // If the user already exists (409 Conflict), try to log them in with the password they provided
//           if (regErr.response?.status === 409) {
//             try {
//               const loginResp = await api.post('/auth/login', { 
//                 email: formData.emailId, 
//                 password: formData.password,
//                 role: 'seller'
//               });
//               response = loginResp;
//             } catch (loginErr) {
//               // If login also fails, throw the original registration error or a custom one
//               throw new Error("This email is already registered. Please check your password or use the Login page.");
//             }
//           } else {
//             throw regErr;
//           }
//         }
//       }

//       const respData = response?.data?.data || response?.data;
//       const userData = respData?.user;
//       const accessToken = respData?.accessToken || respData?.token;
//       const refreshToken = respData?.refreshToken;

//       // If we got tokens (from registration or login), sync them
//       if (userData && accessToken) {
//         const currentSellerId = userData.id || userData.sellerId;

//         // Persist to LocalStorage
//         localStorage.setItem("sellerId", currentSellerId);
//         localStorage.setItem("sellerAccessToken", accessToken);
//         localStorage.setItem("sellerRefreshToken", refreshToken || '');
//         localStorage.setItem("sellerUser", JSON.stringify(userData));
        
//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("user", JSON.stringify(userData));

//         // Sync Redux State
//         if (dispatch) {
//           dispatch(setSellerId(currentSellerId));
//           dispatch(setCredentials({
//             user: { ...userData, role: userData.role || 'seller' },
//             token: accessToken
//           }));
//         }
        
//         onNext(currentSellerId);
//       } else {
//         // If it was just an update and no new tokens were returned, 
//         // we assume the existing session is still valid.
//         onNext(sellerId);
//       }

//     } catch (err) {
//       setApiError(err.response?.data?.message || 'Server connection failed.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fafafa', minHeight: '100vh', fontFamily: 'sans-serif' }}>
//       <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">

//         <Grid item xs={12} md={5}>
//           <Card sx={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}>
//             <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//               <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>Quick & Secure Registration</Typography>
//               <Box sx={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', mb: 4, backgroundColor: '#f3f4f6' }}></Box>
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

//         <Grid item xs={12} md={7}>
//           <StepWrapper>
//             <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 4 }}>Basic Information</Typography>
//             {apiError && <Typography sx={{ color: '#ef4444', fontSize: '14px', fontWeight: 600, mb: 3 }}>{apiError}</Typography>}

//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
//               <Box>
//                 <StyledInputLabel required>Full Name</StyledInputLabel>
//                 <TextField fullWidth name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" variant="outlined" size="small" error={!!errors.fullName} helperText={errors.fullName} sx={customInputStyles} />
//               </Box>

//               <Box>
//                 <StyledInputLabel required>Mobile Number</StyledInputLabel>
//                 <TextField fullWidth name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" variant="outlined" size="small" error={!!errors.mobileNumber} helperText={errors.mobileNumber} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
//                   InputProps={{ endAdornment: ( 
//                     <InputAdornment position="end">
//                       {/* 🌟 NOW ALWAYS CLICKABLE! */}
//                       <VerifyButton 
//                         onClick={() => handleSendOtp('mobile')} 
//                         isVerified={isMobileVerified}
//                       />
//                     </InputAdornment> 
//                   )}} 
//                 />
//               </Box>

//               <Box>
//                 <StyledInputLabel required>Email ID</StyledInputLabel>
//                 <TextField fullWidth name="emailId" value={formData.emailId} onChange={handleInputChange} placeholder="your.email@example.com" variant="outlined" size="small" error={!!errors.emailId} helperText={errors.emailId} sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
//                   InputProps={{ endAdornment: ( 
//                     <InputAdornment position="end">
//                       {/* 🌟 NOW ALWAYS CLICKABLE! */}
//                       <VerifyButton 
//                         onClick={() => handleSendOtp('email')} 
//                         isVerified={isEmailVerified}
//                       />
//                     </InputAdornment> 
//                   )}} 
//                 />
//               </Box>

//               <Box>
//                 <StyledInputLabel required={!sellerId}>Password</StyledInputLabel>
//                 <TextField fullWidth name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? 'text' : 'password'} placeholder={sellerId ? "Leave blank to keep current password" : "Minimum 8 characters"} variant="outlined" size="small" error={!!errors.password} helperText={errors.password} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
//               </Box>

//               <Box>
//                 <StyledInputLabel required={!sellerId}>Confirm Password</StyledInputLabel>
//                 <TextField fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter password" variant="outlined" size="small" error={!!errors.confirmPassword} helperText={errors.confirmPassword} sx={customInputStyles} InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton onClick={handleClickShowConfirmPassword} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }} > {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} </IconButton> </InputAdornment> ), }} />
//               </Box>

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

//             <NavigationButtons onContinue={handleContinue} isLoading={isLoading} isLastStep={false} />
//           </StepWrapper>
//         </Grid>
//       </Grid>

//       <OtpModal
//         open={otpModal.isOpen}
//         onClose={() => setOtpModal({ isOpen: false, type: '', targetValue: '' })}
//         email={otpModal.targetValue} 
//         onVerify={handleVerifyOtp}
//         onResend={handleResendOtp}
//         isLoading={otpLoading}
//         error={otpError}
//       />

//     </Box>
//   );
// }



