import { Box, Typography } from '@mui/material';
import BasicInfo from '../../features/onboarding/steps/BasicInfo';
import BusinessDetails from '../../features/onboarding/steps/BusinessDetails';
import BankDetails from '../../features/onboarding/steps/BankDetails';
import Documents from '../../features/onboarding/steps/Documents';
import StoreSetup from '../../features/onboarding/steps/StoreSetup';
import ReviewSubmit from '../../features/onboarding/steps/ReviewSubmit';
import RegistrationSuccess from './RegistrationSuccess';

const OnboardingContent = ({ step, onNext, onBack, onEditStep }) => {

  const currentStep = Number(step); 
  const sellerId = localStorage.getItem('sellerId');

  const renderStep = () => {
    switch (currentStep) {  
      case 1:
        return <BasicInfo onNext={onNext} onBack={onBack} sellerId={sellerId} />;
      case 2:
        return <BusinessDetails onNext={onNext} onBack={onBack} />;
      case 3:
        return <BankDetails onNext={onNext} onBack={onBack} />
      case 4:
        return <Documents onNext={onNext} onBack={onBack} />
      case 5:
        return <StoreSetup onNext={onNext} onBack={onBack} />
      case 6:
        return <ReviewSubmit onNext={onNext} onBack={onBack} onEditStep={onEditStep} />
      case 7:
        return <RegistrationSuccess />;
      default:
        return <Typography>Invalid Step</Typography>;
    }
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 0, sm: 3, md: 4 }, 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
        {renderStep()}
      </Box>
    </Box>
  );
};

export default OnboardingContent;