import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

const getUserFromStorage = () => { try { return JSON.parse(localStorage.getItem('sellerUser')); } catch { return null; } };

const handleAuthFulfilled = (state, action) => {
  state.loading = false;
  state.user = action.payload.user;
  state.isAuthenticated = true;
  localStorage.setItem('sellerAccessToken', action.payload.accessToken);
  localStorage.setItem('sellerRefreshToken', action.payload.refreshToken);
  localStorage.setItem('sellerUser', JSON.stringify(action.payload.user));
};

export const googleLoginSeller = createAsyncThunk('auth/googleLogin', async (credential, { rejectWithValue }) => {
  try {
    const { data } = await authService.googleLogin(credential);
    if (data.data.user.role !== 'seller') throw new Error('Access restricted to sellers.');
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const loginSeller = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(creds);
    if (data.data.user.role !== 'seller') throw new Error('Access restricted to sellers.');
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const registerSeller = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authService.register(userData);
    if (data.data.user.role !== 'seller') throw new Error('Registration failed.');
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const logoutSeller = createAsyncThunk('auth/logout', async () => { try { await authService.logout(); } catch {} });

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('sellerAccessToken');
    if (!token) return rejectWithValue('No access token');
    const { data } = await authService.getMe();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    isAuthenticated: !!localStorage.getItem('sellerAccessToken'),
    loading: false,
    error: null,
    authChecked: false, // NEW: tells routes whether the initial auth check has finished
  },
  reducers: { 
    clearError: (state) => { state.error = null; },
    // 🌟 ADD THIS: Required by BasicInfo.jsx to sync state after Step 1
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      if (token) {
        localStorage.setItem('sellerAccessToken', token);
      }
      localStorage.setItem('sellerUser', JSON.stringify(user));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLoginSeller.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(googleLoginSeller.fulfilled, handleAuthFulfilled)
      .addCase(googleLoginSeller.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginSeller.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginSeller.fulfilled, handleAuthFulfilled)
      .addCase(loginSeller.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerSeller.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerSeller.fulfilled, handleAuthFulfilled)
      .addCase(registerSeller.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logoutSeller.fulfilled, (state) => {
        state.user = null; state.isAuthenticated = false;
        localStorage.removeItem('sellerAccessToken'); localStorage.removeItem('sellerRefreshToken'); localStorage.removeItem('sellerUser');
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true; // NEW
        localStorage.setItem('sellerUser', JSON.stringify(action.payload));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null; state.isAuthenticated = false;
        state.authChecked = true; // NEW
        localStorage.removeItem('sellerAccessToken'); localStorage.removeItem('sellerRefreshToken');
      });
      
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;