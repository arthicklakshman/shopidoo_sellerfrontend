import { useParams, useNavigate } from 'react-router-dom';
import OnboardingHeader from './OnboardingHeader';
import OnboardingStepper from './OnboardingStepper';
import OnboardingContent from './OnboardingContent';

// 🌟 NEW: Import the sticky support components
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

  // 🌟 NEW: The function that handles the Edit button click!
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

      {/* 🌟 NEW: Sticky Support Icons */}
      <WhatsApp supportNumber="919487082294" />
      <Mobile supportNumber="919487082294" />
    </>
  );
};

export default SellerOnboarding;





// import { useParams, useNavigate } from 'react-router-dom';
// import OnboardingHeader from './OnboardingHeader';
// import OnboardingStepper from './OnboardingStepper';
// import OnboardingContent from './OnboardingContent';

// const TOTAL_STEPS = 6;

// const SellerOnboarding = () => {
//   const { step } = useParams();
//   const navigate = useNavigate();

//   const currentStep = Number(step) || 1;

//   const handleNext = () => {
//     if (currentStep < TOTAL_STEPS) {
//       navigate(`/onboarding/${currentStep + 1}`);
//     } else {
//       navigate('/onboarding/success');
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       navigate(`/onboarding/${currentStep - 1}`);
//     }
//   };

//   // 🌟 NEW: The function that handles the Edit button click!
//   const handleEdit = (stepIndex) => {
//     navigate(`/onboarding/${stepIndex}`);
//   };

//   return (
//     <>
//       <OnboardingHeader step={currentStep} />
//       <OnboardingStepper currentStep={currentStep} />

//       <OnboardingContent
//         step={currentStep}
//         onNext={handleNext}
//         onBack={handleBack}
//         onEditStep={handleEdit} // 🌟 NEW: Pass it to the content component
//       />
//     </>
//   );
// };

// export default SellerOnboarding;