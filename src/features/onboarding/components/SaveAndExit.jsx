import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
import onboardingService from '../onboarding.service';

const SaveAndExit = ({ step }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const clearAndExit = () => {
    // Clear preloaded data
    localStorage.removeItem('onboarding_step_1');
    localStorage.removeItem('onboarding_step_2');
    localStorage.removeItem('onboarding_step_3');
    localStorage.removeItem('onboarding_step_5');
    localStorage.removeItem('onboarding_step_6');
    
    // Clear seller auth to redirect to login
    localStorage.removeItem('sellerId');
    localStorage.removeItem('sellerAccessToken');
    localStorage.removeItem('sellerRefreshToken');
    localStorage.removeItem('sellerUser');

    setIsSaving(false);
    navigate('/login');
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      const sellerId = localStorage.getItem('sellerId');
      if (!sellerId) {
        clearAndExit();
        return;
      }

      let data = null;
      let storageKey = '';
      
      switch (Number(step)) {
        case 1:
          storageKey = 'onboarding_step_1';
          data = JSON.parse(localStorage.getItem(storageKey));
          if (data) {
             await onboardingService.updateBasicInfo(sellerId, {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                businessType: data.businessType,
             });
          }
          break;
        case 2:
          storageKey = 'onboarding_step_2';
          data = JSON.parse(localStorage.getItem(storageKey));
          if (data) {
             await onboardingService.updateBusinessDetails(sellerId, {
                businessName: data.businessName,
                storeName: data.displayStoreName,
                gstNumber: data.gstNumber,
                aadhaarNumber: data.aadhaarNumber,
                panNumber: data.panNumber,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
             });
          }
          break;
        case 3:
          storageKey = 'onboarding_step_3';
          data = JSON.parse(localStorage.getItem(storageKey));
          if (data) {
             await onboardingService.updateBankDetails(sellerId, {
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                ifscCode: data.ifscCode,
                bankProofImage: data.bankProofImage?.data,
             });
          }
          break;
        case 4:
          storageKey = 'onboarding_step_5'; 
          data = JSON.parse(localStorage.getItem(storageKey));
          if (data) {
             const payload = {};
             if (data.panCard?.data) payload.panCardImage = data.panCard.data;
             if (data.aadhaarFront?.data) payload.aadhaarFrontImage = data.aadhaarFront.data;
             if (data.aadhaarBack?.data) payload.aadhaarBackImage = data.aadhaarBack.data;
             if (data.signature?.data) payload.signatureImage = data.signature.data;
             if (data.businessProof?.data) payload.businessProofImage = data.businessProof.data;
             if (data.bankProof?.data) payload.bankProofImage = data.bankProof.data;
             if (data.gstProof?.data) payload.gstProofImage = data.gstProof.data;

             if (Object.keys(payload).length > 0) {
               await onboardingService.updateDocuments(sellerId, payload);
             }
          }
          break;
        case 5:
          storageKey = 'onboarding_step_6'; 
          data = JSON.parse(localStorage.getItem(storageKey));
          if (data) {
             const step2Data = JSON.parse(localStorage.getItem('onboarding_step_2') || '{}');
             const businessAddressText = [
               step2Data.addressLine1,
               step2Data.addressLine2,
               step2Data.city,
               step2Data.state ? step2Data.state.replace('_', ' ').toUpperCase() : '',
               step2Data.pincode ? `- ${step2Data.pincode}` : ''
             ].filter(Boolean).join(', ');

             const payload = {
                categories: JSON.stringify(data.selectedCategories || []), 
                shippingPreference: data.shippingPreference,
                pickupAddress: data.sameAsBusinessAddress ? businessAddressText : data.pickupAddress
             };

             if (data.storeLogo?.data) payload.storeLogo = data.storeLogo.data;
             if (data.storeBanner?.data) payload.storeBanner = data.storeBanner.data;

             await onboardingService.updateStoreSetup(sellerId, payload);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error saving data before exit:', err);
    } finally {
      clearAndExit();
    }
  };

  return (
    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
      <GradientOutlineButton 
        onClick={handleSaveAndExit} 
        disabled={isSaving}
        size="small"
      >
        {isSaving ? 'Saving...' : 'Save & Exit'}
      </GradientOutlineButton>
    </Box>
  );
};

export default SaveAndExit;
