import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';

interface SubscriptionState {
  plan: 'free' | 'pro';
  isActive: boolean;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plan: 'free',
  isActive: false,
  expiresAt: null,
  isLoading: false,
  error: null,
};

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.get<{
        plan: 'free' | 'pro';
        isActive: boolean;
        subscription: { currentPeriodEnd: string } | null;
      }>('/api/subscription/status');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.post<{ message: string }>('/api/subscription/cancel');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setPlan: (state, action) => {
      state.plan = action.payload;
      state.isActive = action.payload === 'pro';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plan = action.payload.plan;
        state.isActive = action.payload.isActive;
        state.expiresAt = action.payload.subscription?.currentPeriodEnd || null;
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPlan } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
