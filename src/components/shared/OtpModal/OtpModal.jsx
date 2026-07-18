import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, Typography, Box, CircularProgress, TextField, IconButton } from '@mui/material';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';

// Your custom components
import GradientButton from '../GradientButton/GradientButton';

export default function OtpModal({ open, onClose, targetValue, type, onVerify, onResend, isLoading, error }) {
  const [timer, setTimer] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Handle the countdown
  useEffect(() => {
    let interval;
    if (open && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    
    if (!open) {
      setTimer(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    }
    
    return () => clearInterval(interval);
  }, [open, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- OTP Input Handlers ---
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return; 

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return; 

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const handleResendClick = async () => {
    setCanResend(false);
    setTimer(600); 
    setOtp(['', '', '', '', '', '']); 
    await onResend();
  };

  const otpString = otp.join('');
return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '16px', 
          p: { xs: 0, sm: 1 }, // 🌟 FIX: Removed extra outer padding on mobile
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          margin: { xs: 2, sm: 4 } // 🌟 FIX: Ensures it doesn't touch screen edges on tiny devices
        }
      }}
    >
      {/* Absolute Close Button matching your design */}
      <IconButton 
        onClick={onClose} 
        sx={{ 
          position: 'absolute', 
          right: { xs: 8, sm: 12 }, // 🌟 FIX: Tighter to edge on mobile
          top: { xs: 8, sm: 12 }, 
          color: '#9ca3af' 
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* 🌟 FIX: Reduced padding significantly on mobile (xs: 2 = 16px) */}
      <DialogContent sx={{ textAlign: 'center', p: { xs: 3, sm: 4 }, px: { xs: 2, sm: 4 } }}>
        
        {/* Dynamic Top Icon */}
        <Box sx={{ 
          width: { xs: 48, sm: 56 }, // 🌟 FIX: Slightly smaller icon background on mobile
          height: { xs: 48, sm: 56 }, 
          borderRadius: '50%', backgroundColor: '#ecfdf5', 
          color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          mx: 'auto', mb: 2 
        }}>
          {type === 'email' ? <MailOutlineIcon /> : <SmartphoneOutlinedIcon />}
        </Box>

        <Typography variant="h6" fontWeight="700" mb={1} color="#111827" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Verify Your {type === 'email' ? 'Email' : 'Mobile'}
        </Typography>
        <Typography variant="body2" color="#6b7280" mb={3} sx={{ lineHeight: 1.6, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          We sent a 6-digit verification code to <br />
          <strong style={{ color: '#111827' }}>{targetValue}</strong>
        </Typography>

        {/* The 6-Box OTP Input */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 0.75, sm: 1.5 }, // 🌟 FIX: Tighter gaps (6px) on mobile so boxes fit
            mb: 2 
          }} 
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoComplete="off"
              inputProps={{
                maxLength: 2,
                // 🌟 FIX: Moved styles to 'sx' below to allow responsive scaling
              }}
              sx={{ 
                width: { xs: '38px', sm: '48px' }, // 🌟 FIX: Boxes shrink to 38px on mobile
                '& .MuiInputBase-input': { 
                  textAlign: 'center', 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }, // 🌟 FIX: Font size scales
                  fontWeight: '600', 
                  padding: { xs: '10px 0', sm: '14px 0' } // 🌟 FIX: Inner padding scales
                },
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '10px', 
                  backgroundColor: '#ffffff',
                  '& fieldset': { borderColor: '#d1d5db' },
                  '&:hover fieldset': { borderColor: '#9ca3af' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' }
                }
              }}
            />
          ))}
        </Box>
        
        {/* Error Message Space */}
        <Box sx={{ minHeight: '24px', mb: 2 }}>
          {error && (
            <Typography color="#ef4444" variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Custom Gradient Button */}
        <GradientButton 
          fullWidth 
          onClick={() => onVerify(otpString)}
          disabled={isLoading || otpString.length < 6}
          sx={{ 
            py: { xs: 1.25, sm: 1.5 }, // 🌟 FIX: Button slightly slimmer on mobile
            mb: 3, 
            fontSize: '0.9rem', 
            fontWeight: 700, 
            borderRadius: '8px',
            background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
            '&.Mui-disabled': { background: '#e5e7eb', color: '#9ca3af', boxShadow: 'none' }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : `VERIFY ${type?.toUpperCase()}`}
        </GradientButton>

        {/* Footer Area */}
        <Box>
          <Typography variant="body2" color="#6b7280" sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Didn't receive the code? 
            {canResend ? (
              <span 
                onClick={handleResendClick} 
                style={{ color: '#0FB9B1', fontWeight: 600, cursor: 'pointer' }}
              >
                Resend Code
              </span>
            ) : (
              <span style={{ color: '#0FB9B1', fontWeight: 600 }}>
                Resend in {formatTime(timer)}
              </span>
            )}
          </Typography>
        </Box>

      </DialogContent>
    </Dialog>
  );
}