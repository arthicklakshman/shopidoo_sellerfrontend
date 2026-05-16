import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleSellerLoginButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      // Send the secure Google token to YOUR backend
      const response = await axios.post('/api/auth/google-seller', {
        token: credentialResponse.credential,
      });

      // If backend says okay, save your user/JWT to Redux and redirect
      if (response.data.success) {
        // dispatch(setCredentials(response.data.user)); // Assuming you have this action
        navigate('/dashboard');
      }
    } catch (error) {
      // The backend rejected the login (e.g., status pending, not a seller)
      const errorMsg = error.response?.data?.message || 'Google Login Failed';
      console.error("Backend validation failed:", errorMsg);
      // dispatch(setError(errorMsg)); // Display this error in your UI
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.error('Google Login Widget Failed');
      }}
      useOneTap={false}
      text="signin_with" // Customizes the button text
      shape="rectangular"
    />
  );
};

export default GoogleSellerLoginButton;