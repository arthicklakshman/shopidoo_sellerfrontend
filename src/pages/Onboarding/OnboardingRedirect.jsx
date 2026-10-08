// Save as: shopidoo_sellerfrontend/src/pages/Onboarding/OnboardingRedirect.jsx
// (replaces the earlier version of this file)
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import onboardingService from '../../features/onboarding/onboarding.service';
import { prefillOnboardingFromProfile } from '../../features/onboarding/prefillFromProfile';

const TOTAL_STEPS = 6;
const clampStep = (n) => Math.min(Math.max(Number(n) || 1, 1), TOTAL_STEPS);

// Used for the plain "/onboarding" URL (after login). It loads the seller's saved profile,
// fills the step forms with it, and opens the step the seller should continue from.
export default function OnboardingRedirect() {
  const { user, authChecked } = useSelector((s) => s.auth);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!authChecked) return undefined;
    let cancelled = false;

    const decide = async () => {
      let step = clampStep(user?.onboardingStep);
      const token = localStorage.getItem('sellerAccessToken');

      if (token && user?.role === 'seller') {
        try {
          const res = await onboardingService.getProfile({
            headers: { Authorization: `Bearer ${token}` },
          });
          const me = res?.data?.data || res?.data;
          if (me) {
            prefillOnboardingFromProfile(me);
            if (me.onboardingStep) step = clampStep(me.onboardingStep);
          }
        } catch (err) {
          console.error('Could not load seller profile for onboarding', err);
        }
      }

      if (!cancelled) setTarget(`/onboarding/${step}`);
    };

    decide();
    return () => { cancelled = true; };
  }, [authChecked, user?.id]);

  if (!target) return null;
  return <Navigate to={target} replace />;
}