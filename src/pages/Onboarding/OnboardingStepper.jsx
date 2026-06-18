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

// ✅ Custom Connector (UNCHANGED)
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#e5e7eb',
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

// ✅ Custom Step Icon (UPDATED TO GREEN THEME)
const CustomStepIconRoot = styled('div')(({ ownerState }) => ({
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
  ...(ownerState.active && {
    background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)', // 🌟 Teal to Green
    color: '#ffffff',
    boxShadow: '0 4px 10px 0 rgba(11, 132, 87, 0.25)', // 🌟 Green shadow
  }),
  ...(ownerState.completed && {
    background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)', // 🌟 Teal to Green
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

  // 🔥 Convert to 0-based index (IMPORTANT)
  const activeStep = currentStep - 1;

  const totalSteps = steps.length;
  
  // ✅ FIX: Changed the math so Step 1 = 0% and Step 6 = 100%
  // We divide the 'activeStep' (0-based) by 'totalSteps - 1'
  const progressPercentage = totalSteps > 1 
    ? Math.round((activeStep / (totalSteps - 1)) * 100) 
    : 100;

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', p: 3, fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #f0fdfa 0%, #b2eed8 100%)', borderRadius: 3, my: 3, }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
        <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '15px' }}>
          Step {currentStep} of {totalSteps}
        </Typography>
        {/* 🌟 UPDATED: Green text color */}
        <Typography sx={{ color: '#0B8457', fontWeight: 600, fontSize: '14px' }}>
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
          backgroundColor: '#e5e7eb', // Slightly lighter track to make the dark green pop
          mb: 5,
          '& .MuiLinearProgress-bar': {
            // 🌟 Starts with a bright/light teal and fades into a very dark, rich green
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
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel 
              StepIconComponent={CustomStepIcon}
              sx={{
                '& .MuiStepLabel-label': {
                  mt: 1.5,
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: 400,
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: '#4b5563',
                  fontWeight: 500,
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