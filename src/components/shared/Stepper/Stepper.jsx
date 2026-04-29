import { Box, Stepper, Step, StepLabel } from '@mui/material';

const CustomStepper = ({ steps, activeStep }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CustomStepper;``