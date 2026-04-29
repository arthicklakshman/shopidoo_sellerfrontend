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
  try { const { data } = await authService.getMe(); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getUserFromStorage(), isAuthenticated: !!localStorage.getItem('sellerAccessToken'), loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true; })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null; state.isAuthenticated = false;
        localStorage.removeItem('sellerAccessToken'); localStorage.removeItem('sellerRefreshToken');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
