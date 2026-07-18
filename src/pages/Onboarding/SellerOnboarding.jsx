import { useParams, useNavigate } from 'react-router-dom';
import { Portal } from '@mui/material'; 
import OnboardingHeader from './OnboardingHeader';
import OnboardingStepper from './OnboardingStepper';
import OnboardingContent from './OnboardingContent';
import WhatsApp from '../../components/shared/OnboardingHelpline/WhatsApp';
import Mobile from '../../components/shared/OnboardingHelpline/Mobile';

const TOTAL_STEPS = 6;

const SellerOnboarding = () => {
  const { step } = useParams();
  const navigate = useNavigate();

  const currentStep = Number(step) || 1;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      navigate(`/onboarding/${currentStep + 1}`);
    } else {
      navigate('/onboarding/success');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/onboarding/${currentStep - 1}`);
    }
  };

  const handleEdit = (stepIndex) => {
    navigate(`/onboarding/${stepIndex}`);
  };

  return (
    <>
      <OnboardingHeader step={currentStep} />
      <OnboardingStepper currentStep={currentStep} />

      <OnboardingContent
        step={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onEditStep={handleEdit}
      />
      
      {/* 🌟 2. Wrap your FABs in the Portal */}
      <Portal>
        <WhatsApp supportNumber="919487082294" />
        <Mobile supportNumber="919487082294" />
      </Portal>
    </>
  );
};

export default SellerOnboarding;