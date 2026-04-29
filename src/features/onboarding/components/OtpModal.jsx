import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Modal, IconButton, TextField, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

import GradientButton from "../../../components/shared/GradientButton/GradientButton";
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '450px' },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  outline: 'none',
};

export default function OtpModal({ open, onClose, email, onVerify, onResend, isLoading, error }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Handle the countdown timer
  useEffect(() => {
    let interval;
    if (open && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, timer]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setOtp(new Array(6).fill(""));
      setTimer(60);
      // Auto-focus the first input after a slight delay for modal rendering
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  // Handle typing in the boxes
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // If empty, move to previous box
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle Paste (e.g. pasting "123456" into the first box)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Ensure it's numbers only

    const pastedArray = pastedData.split("");
    const newOtp = [...otp];
    
    pastedArray.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    
    setOtp(newOtp);
    
    // Focus the last filled input
    const focusIndex = Math.min(pastedArray.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const submitOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      onVerify(otpValue);
    }
  };

  const handleResendClick = () => {
    setOtp(new Array(6).fill(""));
    setTimer(60);
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <Modal open={open} onClose={!isLoading ? onClose : null} aria-labelledby="otp-verification-modal">
      <Box sx={modalStyle}>
        
        {/* Close Button */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: -2 }}>
          <IconButton onClick={onClose} disabled={isLoading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Header Icon & Text */}
        <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#ecfdf5', mb: 2 }}>
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: '#059669' }} />
        </Box>
        
        <Typography variant="h5" fontWeight={700} color="#111827" mb={1}>
          Verify Your Email
        </Typography>
        
        <Typography variant="body2" color="#6b7280" textAlign="center" mb={4}>
          We sent a 6-digit verification code to<br/>
          <Box component="span" fontWeight={600} color="#111827">{email}</Box>
        </Typography>

        {/* 6-Box OTP Inputs */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 3 }} onPaste={handlePaste}>
          {otp.map((data, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ 
                maxLength: 1, 
                style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, padding: '12px 0' } 
              }}
              disabled={isLoading}
              sx={{
                width: { xs: '45px', sm: '50px' },
                backgroundColor: '#f9fafb',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&.Mui-focused fieldset': { borderColor: '#059669', borderWidth: '2px' }
                }
              }}
            />
          ))}
        </Box>

        {/* Error Message */}
        {error && (
          <Typography color="error" fontSize="13px" fontWeight={500} mb={2}>
            {error}
          </Typography>
        )}

        {/* Verify Button */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <GradientButton 
            fullWidth 
            onClick={submitOtp} 
            disabled={otp.join("").length !== 6 || isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify Email'}
          </GradientButton>
        </Box>

        {/* Resend Logic */}
        <Typography fontSize="14px" color="#6b7280">
          Didn't receive the code?{' '}
          {timer > 0 ? (
            <Box component="span" fontWeight={600} color="#9ca3af">
              Resend in 00:{timer < 10 ? `0${timer}` : timer}
            </Box>
          ) : (
            <Box 
              component="span" 
              fontWeight={600} 
              color="#059669" 
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={handleResendClick}
            >
              Resend Code
            </Box>
          )}
        </Typography>

      </Box>
    </Modal>
  );
}