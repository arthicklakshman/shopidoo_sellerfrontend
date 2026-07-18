import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  styled,
} from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

const steps = [
  'Basic Info',
  'Business',
  'Bank Details',
  'Documents',
  'Store Setup',
  'Review'
];

// ✅ Custom Connector (UPDATED FOR RESPONSIVENESS)
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20, // Desktop (Half of 40px icon)
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
    // 🌟 Mobile adjustments for the connector
    [theme.breakpoints.down('sm')]: {
      top: 14, // Mobile (Half of 28px icon)
      left: 'calc(-50% + 14px)',
      right: 'calc(50% + 14px)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#e5e7eb',
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

// ✅ Custom Step Icon (UPDATED FOR RESPONSIVENESS)
const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: '#f3f4f6',
  zIndex: 1,
  color: '#4b5563',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '15px',
  // 🌟 Shrink the icon on mobile
  [theme.breakpoints.down('sm')]: {
    width: 28,
    height: 28,
    fontSize: '12px',
  },
  ...(ownerState.active && {
    background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)', 
    color: '#ffffff',
    boxShadow: '0 4px 10px 0 rgba(11, 132, 87, 0.25)', 
  }),
  ...(ownerState.completed && {
    background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)', 
    color: '#ffffff',
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {icon}
    </CustomStepIconRoot>
  );
}

// ✅ MAIN COMPONENT
export default function OnboardingStepper({ currentStep = 1 }) {
  const activeStep = currentStep - 1;
  const totalSteps = steps.length;
  
  const progressPercentage = totalSteps > 1 
    ? Math.round((activeStep / (totalSteps - 1)) * 100) 
    : 100;

  return (
    <Box sx={{ 
      width: { xs: 'calc(100% - 32px)', md: '100%' }, 
      maxWidth: '800px', 
      mx: 'auto',
      p: { xs: 2, sm: 3 }, 
      fontFamily: 'sans-serif', 
      background: 'linear-gradient(135deg, #f0fdfa 0%, #b2eed8 100%)', 
      borderRadius: 3, 
      my: { xs: 2, sm: 3 }, 
    }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
        <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: { xs: '13px', sm: '15px' } }}>
          Step {currentStep} of {totalSteps}
        </Typography>
        <Typography sx={{ color: '#0B8457', fontWeight: 600, fontSize: { xs: '12px', sm: '14px' } }}>
          You're {progressPercentage}% done 🚀
        </Typography>
      </Box>

      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={progressPercentage} 
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e5e7eb', 
          mb: { xs: 3, sm: 5 }, // Less gap below progress bar on mobile
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
            borderRadius: 4,
          }
        }}
      />

      {/* Stepper */}
      <Stepper 
        alternativeLabel 
        activeStep={activeStep} 
        connector={<CustomConnector />}
        sx={{ width: '100%', m: 0, p: 0 }} 
      >
        {steps.map((label, index) => (
          <Step 
            key={label}
            sx={{ 
              px: 0, 
              minWidth: 0,
            }}
          >
            <StepLabel 
              StepIconComponent={CustomStepIcon}
              sx={{
                p: 0,
                '& .MuiStepLabel-iconContainer': {
                  paddingRight: 0, 
                },
                '& .MuiStepLabel-label': {
                  mt: { xs: 0.5, sm: 1.5 }, 
                  color: '#6b7280',
                  fontSize: { xs: '9.5px', sm: '13px' }, 
                  fontWeight: 400,
                  
              
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  hyphens: 'auto',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#4b5563',
                  fontWeight: 600, 
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#4b5563',
                  fontWeight: 500,
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
    </Box>
  );
}