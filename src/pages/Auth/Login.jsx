import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Typography, Alert,
  InputAdornment, IconButton, Link, Divider, Button
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useDispatch, useSelector } from 'react-redux';
import { loginSeller, googleLoginSeller, clearError } from '../../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';

// 🌟 IMPORT CUSTOM BUTTON
import GradientButton from '../../components/shared/GradientButton/GradientButton'; 

// 🌟 Custom styling for TextFields to use your green theme on focus
const customInputStyles = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#0B8457', // Border turns green when clicked
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0B8457', // Label turns green when clicked
  },
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (field) => (e) => {
    dispatch(clearError());
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginSeller(form));

      if (loginSeller.fulfilled.match(result)) {
        const user = result.payload.user;

        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'seller') {
          // ✅ FIX: Route the user based on their status immediately after login
          if (user.status === 'active') {
            navigate('/dashboard');
          } else {
            // Send pending or suspended users to the success/waiting page
            navigate('/onboarding/success'); 
          }
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <StorefrontIcon sx={{ fontSize: 48, color: '#0B8457' }} />
          <Typography variant="h5" fontWeight={800}>Seller Portal</Typography>
          <Typography color="text.secondary" variant="body2">Sign in to manage your store</Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                fullWidth required
                autoFocus
                sx={customInputStyles}
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                fullWidth required
                sx={{ ...customInputStyles, mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
                        {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* 🌟 REPLACED WITH GRADIENT BUTTON */}
              <GradientButton type="submit" fullWidth disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </GradientButton>
            </Box>

            {/* 🌟 ADDED: Google Login Section */}
            <Divider sx={{ my: 2, typography: 'body2', color: 'text.secondary' }}>
              OR
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 0.5 }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const result = await dispatch(googleLoginSeller(credentialResponse.credential));

                  if (googleLoginSeller.fulfilled.match(result)) {
                    const user = result.payload.user;

                    if (user.role === 'admin') {
                      navigate('/admin/dashboard');
                    } else if (user.role === 'seller') {
                      if (user.status === 'active') {
                        navigate('/dashboard');
                      } else {
                        navigate('/onboarding/success'); 
                      }
                    } else {
                      navigate('/');
                    }
                  }
                }}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="300"
              />
            </Box>
            <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ mb: 2 }}>
              (only validate if you have seller account)
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" align="center" color="text.secondary">
              New seller?{' '}
              <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: '#0B8457', textDecorationColor: '#0B8457' }}>
                Create an account
              </Link>
            </Typography>

            {/* 🌟 ADDED: Forgot Password Link */}
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1.5 }}>
              Forgot password?{' '}
              <Link component={RouterLink} to="/forgot-password" fontWeight={600} sx={{ color: '#0B8457', textDecorationColor: '#0B8457' }}>
                Click here
              </Link>
            </Typography>

          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;






// import { useState } from 'react';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import {
//   Box, Card, CardContent, TextField, Typography, Alert,
//   InputAdornment, IconButton, Link, Divider,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginSeller, clearError } from '../../features/auth/authSlice';

// // 🌟 IMPORT CUSTOM BUTTON
// import GradientButton from '../../components/shared/GradientButton/GradientButton'; 

// // 🌟 Custom styling for TextFields to use your green theme on focus
// const customInputStyles = {
//   mb: 2,
//   '& .MuiOutlinedInput-root': {
//     '&.Mui-focused fieldset': {
//       borderColor: '#0B8457', // Border turns green when clicked
//     },
//   },
//   '& .MuiInputLabel-root.Mui-focused': {
//     color: '#0B8457', // Label turns green when clicked
//   },
// };

// const Login = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading, error } = useSelector((s) => s.auth);
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPwd, setShowPwd] = useState(false);

//   const handleChange = (field) => (e) => {
//     dispatch(clearError());
//     setForm((p) => ({ ...p, [field]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const result = await dispatch(loginSeller(form));

//       if (loginSeller.fulfilled.match(result)) {
//         const user = result.payload.user;

//         if (user.role === 'admin') {
//           navigate('/admin/dashboard');
//         } else if (user.role === 'seller') {
//           // ✅ FIX: Route the user based on their status immediately after login
//           if (user.status === 'active') {
//             navigate('/dashboard');
//           } else {
//             // Send pending or suspended users to the success/waiting page
//             navigate('/onboarding/success'); 
//           }
//         } else {
//           navigate('/');
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <StorefrontIcon sx={{ fontSize: 48, color: '#0B8457' }} />
//           <Typography variant="h5" fontWeight={800}>Seller Portal</Typography>
//           <Typography color="text.secondary" variant="body2">Sign in to manage your store</Typography>
//         </Box>

//         <Card>
//           <CardContent sx={{ p: 3 }}>
//             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//             <Box component="form" onSubmit={handleSubmit}>
//               <TextField
//                 label="Email"
//                 type="email"
//                 value={form.email}
//                 onChange={handleChange('email')}
//                 fullWidth required
//                 autoFocus
//                 sx={customInputStyles}
//               />
//               <TextField
//                 label="Password"
//                 type={showPwd ? 'text' : 'password'}
//                 value={form.password}
//                 onChange={handleChange('password')}
//                 fullWidth required
//                 sx={{ ...customInputStyles, mb: 3 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
//                         {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
              
//               {/* 🌟 REPLACED WITH GRADIENT BUTTON */}
//               <GradientButton type="submit" fullWidth disabled={loading}>
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </GradientButton>
//             </Box>

//             <Divider sx={{ my: 2 }} />

//             <Typography variant="body2" align="center" color="text.secondary">
//               New seller?{' '}
//               <Link component={RouterLink} to="/register" fontWeight={600} sx={{ color: '#0B8457', textDecorationColor: '#0B8457' }}>
//                 Create an account
//               </Link>
//             </Typography>

//             {/* 🌟 ADDED: Forgot Password Link */}
//             <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1.5 }}>
//               Forgot password?{' '}
//               <Link component={RouterLink} to="/forgot-password" fontWeight={600} sx={{ color: '#0B8457', textDecorationColor: '#0B8457' }}>
//                 Click here
//               </Link>
//             </Typography>

//           </CardContent>
//         </Card>
//       </motion.div>
//     </Box>
//   );
// };

// export default Login;

