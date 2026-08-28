import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, TextField, 
  InputAdornment, IconButton, InputLabel, Link, Alert
} from '@mui/material';

// Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

// Shared Components & Hooks
import { useOtp } from '../../hooks/useOtp'; 
import OtpModal from '../../components/shared/OtpModal/OtpModal';
import GradientButton from '../../components/shared/GradientButton/GradientButton';
import { validateEmail, validateMobile, validatePassword } from '../../utils/validation';
import { authService } from '../../services/auth.service';
import SEO from '../../components/SEO/SEO'; 

// --- STYLES & REUSABLE INLINE COMPONENTS ---
const StyledInputLabel = ({ children }) => (
  <InputLabel sx={{ color: '#111827', fontSize: '13px', fontWeight: 600, mb: 0.5 }}>
    {children}
  </InputLabel>
);

const customInputStyles = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #0FB9B1' },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': { border: '1px solid #ef4444' },
  '& .MuiOutlinedInput-input': { padding: '12px 14px', fontSize: '14px', color: '#111827' },
  '& .MuiOutlinedInput-input::-ms-reveal': { display: 'none' },
  '& .MuiOutlinedInput-input::-ms-clear': { display: 'none' }
};

// Reusing your VerifyButton logic with the specific colors you asked for!
const VerifyButton = ({ onClick, isVerified }) => (
  <GradientButton
    type="button"
    onClick={onClick}
    disabled={isVerified}
    sx={{
      py: 0.6, px: 3, borderRadius: '6px', textTransform: 'none', fontSize: '0.875rem', minWidth: 'auto',
      background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)', // Your requested colors
      boxShadow: 'none',
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

// --- MAIN COMPONENT ---
export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🌟 Global OTP Hook
  const { 
    otpModal, otpLoading, otpError, isEmailVerified, isMobileVerified, 
    sendOtp, verifyOtp, resendOtp, closeOtpModal, resetVerification 
  } = useOtp();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
    
    // If they change the email/mobile, reset that specific verification!
    if (name === 'email' && isEmailVerified) resetVerification('email');
    if (name === 'phone' && isMobileVerified) resetVerification('mobile');
  };
const handleSendOtpClick = async (type) => {
    if (type === 'email') {
      const err = validateEmail(formData.email);
      if (err) return setErrors(prev => ({ ...prev, email: err }));
      try { 
        // 🚨 ADD 'forgot_password' HERE
        await sendOtp('email', formData.email, 'forgot_password'); 
      } 
      catch (error) { setErrors(prev => ({ ...prev, email: error.message })); }
    } else if (type === 'mobile') {
      const err = validateMobile(formData.phone);
      if (err) return setErrors(prev => ({ ...prev, phone: err }));
      try { 
        // 🚨 ADD 'forgot_password' HERE
        await sendOtp('mobile', formData.phone, 'forgot_password'); 
      } 
      catch (error) { setErrors(prev => ({ ...prev, phone: error.message })); }
    }
  };

 const handleSaveToDatabase = async () => {
    // 1. Validate Passwords
    const passErr = validatePassword(formData.newPassword);
    if (passErr) return setErrors(prev => ({ ...prev, newPassword: passErr }));
    if (formData.newPassword !== formData.confirmPassword) {
      return setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    }

    // 2. Final security check just in case!
    if (!isEmailVerified || !isMobileVerified) {
      return setApiError("Both Email and Mobile must be verified to change password.");
    }

    try {
      setIsSubmitting(true);
      
      // 🌟 Identify the correct portal context ('user' or 'seller')
      // You can read this from a prop, your URL path, or a constant string.
     const currentPortalRole = window.location.pathname.includes('/seller') ? 'seller' : 'user'; 

      // 3. Send to backend service with the required role parameter included
      await authService.resetPassword({
        email: formData.email,
        phone: formData.phone,
        newPassword: formData.newPassword,
        role: currentPortalRole // ⚡ Fixed: Now your backend will pass validation!
      });
      
      setSuccessMessage("Password successfully updated! You can now login.");
      
      // Optional: Clear form
      setFormData({ email: '', phone: '', newPassword: '', confirmPassword: '' });
      resetVerification('email');
      resetVerification('mobile');
      
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
  minHeight: '100vh', display: 'flex', alignItems: 'center', 
  justifyContent: 'center', bgcolor: 'background.default', p: 2 
}}>
      <SEO title="Reset Password" noIndex={true} />
      <Box sx={{ width: '100%', maxWidth: '500px' }}>
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <VpnKeyOutlinedIcon sx={{ fontSize: 40, color: '#0FB9B1', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
            Account Recovery
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            Verify your identity to reset your password
          </Typography>
        </Box>

        <Card sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            
            {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* --- STEP 1: VERIFY EMAIL & MOBILE --- */}
              <Box>
                <StyledInputLabel>Registered Email</StyledInputLabel>
                <TextField 
                  fullWidth name="email" value={formData.email} onChange={handleInputChange} 
                  placeholder="Enter your registered email" variant="outlined" size="small" 
                  error={!!errors.email} helperText={errors.email} 
                  sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      <VerifyButton onClick={() => handleSendOtpClick('email')} isVerified={isEmailVerified} />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              <Box>
                <StyledInputLabel>Registered Phone</StyledInputLabel>
                <TextField 
                  fullWidth name="phone" value={formData.phone} onChange={handleInputChange} 
                  placeholder="Enter your registered phone number" variant="outlined" size="small" 
                  error={!!errors.phone} helperText={errors.phone} 
                  sx={{ ...customInputStyles, '& .MuiOutlinedInput-root': { pr: 0.5 } }} 
                  InputProps={{ endAdornment: ( 
                    <InputAdornment position="end">
                      <VerifyButton onClick={() => handleSendOtpClick('mobile')} isVerified={isMobileVerified} />
                    </InputAdornment> 
                  )}} 
                />
              </Box>

              {/* --- STEP 2: ONLY SHOW PASSWORDS IF BOTH ARE VERIFIED --- */}
              {(isEmailVerified && isMobileVerified) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, pt: 3, borderTop: '1px dashed #e5e7eb' }}>
                  <Typography variant="subtitle2" sx={{ color: '#0B8457', fontWeight: 700 }}>
                    Identity verified! You may now enter a new password.
                  </Typography>

                  <Box>
                    <StyledInputLabel>Enter New Password</StyledInputLabel>
                    <TextField 
                      fullWidth name="newPassword" value={formData.newPassword} onChange={handleInputChange} 
                      type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" 
                      variant="outlined" size="small" error={!!errors.newPassword} helperText={errors.newPassword} 
                      sx={customInputStyles} 
                      InputProps={{ endAdornment: ( 
                        <InputAdornment position="end"> 
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }}> 
                            {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} 
                          </IconButton> 
                        </InputAdornment> 
                      )}} 
                    />
                  </Box>

                  <Box>
                    <StyledInputLabel>Re-enter Password</StyledInputLabel>
                    <TextField 
                      fullWidth name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} 
                      type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter new password" 
                      variant="outlined" size="small" error={!!errors.confirmPassword} helperText={errors.confirmPassword} 
                      sx={customInputStyles} 
                      InputProps={{ endAdornment: ( 
                        <InputAdornment position="end"> 
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: '#9ca3af', mr: 0.5 }}> 
                            {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />} 
                          </IconButton> 
                        </InputAdornment> 
                      )}} 
                    />
                  </Box>

                  <GradientButton 
                    fullWidth 
                    onClick={handleSaveToDatabase}
                    disabled={isSubmitting}
                    sx={{ 
                      py: 1.5, fontSize: '15px', mt: 1,
                      background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)' 
                    }}
                  >
                    {isSubmitting ? 'SAVING...' : 'SAVE NEW PASSWORD'}
                  </GradientButton>
                </Box>
              )}
            </Box>

            {/* Back to Login Link */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Remember your password?{' '}
                <Link href="/login" underline="hover" sx={{ color: '#0FB9B1', fontWeight: 600 }}>
                  Back to login
                </Link>
              </Typography>
            </Box>

          </CardContent>
        </Card>
      </Box>

      {/* 🌟 YOUR SHARED OTP MODAL */}
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