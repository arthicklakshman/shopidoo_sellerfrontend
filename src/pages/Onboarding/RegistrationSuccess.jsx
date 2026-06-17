import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import Confetti from 'react-confetti';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';

import GradientButton from '../../components/shared/GradientButton/GradientButton';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSeller } from '../../features/auth/authSlice';

const USER_FRONTEND_URL = import.meta.env.VITE_USER_FRONTEND_URL || 'http://localhost:5173/';

// Helper component for the "What Happens Next" list
const StepItem = ({ num, title, desc }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
    <Avatar sx={{
      width: 24,
      height: 24,
      bgcolor: '#2563eb', // Blue
      fontSize: '12px',
      fontWeight: 700,
      mt: 0.5
    }}>
      {num}
    </Avatar>
    <Box>
      <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px', mb: 0.2 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#6b7280', fontSize: '13px' }}>
        {desc}
      </Typography>
    </Box>
  </Box>
);

export default function RegistrationSuccess() {
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  // Handle window sizing for the confetti canvas
  useEffect(() => {
    setIsClient(true);
    const updateDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);



  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleReturnToShop = () => {
    window.location.assign(USER_FRONTEND_URL);
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc', // Very light blue/gray background
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden',
      py: 4
    }}>

      {/* Left Confetti Cannon */}
      {isClient && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          confettiSource={{ x: 0, y: windowDimensions.height / 2, w: 10, h: 10 }}
          initialVelocityX={15}
          initialVelocityY={-20}
          gravity={0.15}
          numberOfPieces={120}
          recycle={false}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}

      {/* Right Confetti Cannon */}
      {isClient && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          confettiSource={{ x: windowDimensions.width, y: windowDimensions.height / 2, w: 10, h: 10 }}
          initialVelocityX={-15}
          initialVelocityY={-20}
          gravity={0.15}
          numberOfPieces={120}
          recycle={false}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />
      )}

      {/* Main Success Card */}
      <Card sx={{
        maxWidth: '650px',
        width: '100%',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        zIndex: 10, // Keeps the card above the falling confetti
        mx: 2,
        backgroundColor: '#ffffff'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{
              width: 90,
              height: 90,
              backgroundColor: '#d1fae5', // Light green outer circle
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <CheckCircleIcon sx={{ fontSize: 55, color: '#10b981' }} />
            </Box>

            <Typography variant="h4" sx={{
              fontWeight: 800,
              mb: 1.5,
              background: 'linear-gradient(to right, #3b82f6, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.3
            }}>
              {user?.status === 'suspended' ? 'Account Suspended 🚫' : 'Application Submitted! 🎉'}
            </Typography>

            <Typography sx={{ color: '#4b5563', fontSize: '15px', fontWeight: 500 }}>
              {user?.status === 'suspended' ? 'Your seller access has been temporarily revoked.' : 'Your Seller Account is Under Review'}
            </Typography>
          </Box>

          {/* 3 Status Cards */}
          <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px',
                p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <Typography sx={{ color: '#1d4ed8', fontSize: '24px', fontWeight: 700, mb: 1 }}>48h</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '12px' }}>Estimated Review Time</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px',
                p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <CheckOutlinedIcon sx={{ color: '#8b5cf6', fontSize: 28, mx: 'auto', mb: 1 }} />
                <Typography sx={{ color: '#64748b', fontSize: '12px' }}>Documents Received</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px',
                p: 2.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <Box sx={{
                  backgroundColor: '#e0e7ff', width: 32, height: 24, borderRadius: '4px', mx: 'auto', mb: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Typography sx={{ color: '#4f46e5', fontSize: '12px', fontWeight: 700 }}>@</Typography>
                </Box>
                <Typography sx={{ color: '#64748b', fontSize: '12px' }}>Email Confirmation Sent</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* What Happens Next Section */}
          <Box sx={{ backgroundColor: '#f8fafc', borderRadius: '12px', p: 3, mb: 4 }}>
            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '15px', mb: 3 }}>
              What Happens Next?
            </Typography>
            <StepItem num="1" title="Document Verification" desc="Our team will verify your submitted documents" />
            <StepItem num="2" title="Account Activation" desc="You'll receive an email once your account is approved" />
            <Box sx={{ mb: -2.5 }}>
              <StepItem num="3" title="Start Selling" desc="Begin listing your products and reach millions of customers" />
            </Box>
          </Box>

          {/* Important Alert Box */}
          <Box sx={{
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            borderRadius: '8px',
            p: 2,
            textAlign: 'center',
            mb: 4
          }}>
            <Typography sx={{ color: '#854d0e', fontSize: '13px' }}>
              <Box component="span" sx={{ fontWeight: 700 }}>Important: </Box>
              We've sent a confirmation email with your application details. Please check your spam folder if you don't see it in your inbox.
            </Typography>
          </Box>

          {/* Go Back to Shop Button */}
          <Box display="flex" justifyContent="center">
            <GradientButton
              onClick={handleReturnToShop}
              startIcon={<StorefrontIcon />}
              sx={{
                mb: 1.5,
                width: {
                  xs: '100%',   // mobile
                  sm: '300px',  // small screens
                  md: '400px'   // desktop
                }
              }}
            >
              Go Back to Shop
            </GradientButton>
          </Box>
          <Typography sx={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', mb: 4 }}>
            We'll notify you via email as soon as your account status changes.
          </Typography>

          <Divider sx={{ mb: 3, borderColor: '#f3f4f6' }} />

          {/* Support Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#6b7280', fontSize: '13px', mb: 2 }}>
              Questions? Need help?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Button size="small" startIcon={<PhoneInTalkOutlinedIcon fontSize="small" />} sx={{ color: '#e11d48', textTransform: 'none', fontWeight: 500, p: 0, '&:hover': { background: 'transparent', textDecoration: 'underline' } }}>
                Call Support
              </Button>
              <Button size="small" startIcon={<ChatBubbleOutlineIcon fontSize="small" />} sx={{ color: '#16a34a', textTransform: 'none', fontWeight: 500, p: 0, '&:hover': { background: 'transparent', textDecoration: 'underline' } }}>
                WhatsApp Us
              </Button>
              <Button size="small" startIcon={<MailOutlinedIcon fontSize="small" />} sx={{ color: '#8b5cf6', textTransform: 'none', fontWeight: 500, p: 0, '&:hover': { background: 'transparent', textDecoration: 'underline' } }}>
                Email Help
              </Button>
            </Box>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
