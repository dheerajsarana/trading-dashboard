import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginCredentials, RegisterData } from '../api/auth.api';
import { authService, User } from '../services/auth.service';
import { setPlan } from './subscriptionSlice';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

/**
 * Register new user
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      authService.saveToken(response.token);
      authService.saveUser(response.user);
      dispatch(setPlan(response.user.subscriptionStatus || 'free'));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      authService.saveToken(response.token);
      authService.saveUser(response.user);
      dispatch(setPlan(response.user.subscriptionStatus || 'free'));
      return response;
    } catch (error: any) {
      console.log('Login error caught:', error);
      console.log('Error message:', error.message);
      const errorMessage = error.message || 'Login failed';
      console.log('Rejecting with:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      authService.clearAuth();
      return null;
    } catch (error: any) {
      // Clear auth even if API call fails
      authService.clearAuth();
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * Check authentication status (verify token on mount)
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = authService.getToken();
      if (!token) {
        return null;
      }

      // Verify token with backend
      const response = await authApi.getMe();
      authService.saveUser(response.user);
      dispatch(setPlan(response.user.subscriptionStatus || 'free'));
      return { user: response.user, token };
    } catch (error: any) {
      // Token is invalid, clear auth
      authService.clearAuth();
      return rejectWithValue(error.message || 'Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.log('Login rejected, error set to:', action.payload);
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
