import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Screenshot } from '../types';
import { screenshotsApi, UploadScreenshotsParams } from '../api/screenshots.api';
import { RootState } from './store';

interface ScreenshotState {
  screenshots: Screenshot[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: ScreenshotState = {
  screenshots: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
};

/**
 * Upload screenshots for a trade
 */
export const uploadScreenshots = createAsyncThunk(
  'screenshots/upload',
  async (
    params: UploadScreenshotsParams,
    { rejectWithValue, dispatch }
  ) => {
    try {
      // Reset progress
      dispatch(setUploadProgress(0));

      // Upload with progress tracking
      const response = await screenshotsApi.uploadScreenshots(params, (progress) => {
        dispatch(setUploadProgress(progress));
      });

      return response.screenshots;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload screenshots');
    }
  }
);

/**
 * Fetch screenshots for a specific trade
 */
export const fetchTradeScreenshots = createAsyncThunk(
  'screenshots/fetchTrade',
  async (
    params: { tradeId?: string; mt5TradeId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await screenshotsApi.getTradeScreenshots(
        params.tradeId,
        params.mt5TradeId
      );
      return response.screenshots;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch screenshots');
    }
  }
);

/**
 * Delete a screenshot
 */
export const deleteScreenshot = createAsyncThunk(
  'screenshots/delete',
  async (screenshotId: string, { rejectWithValue }) => {
    try {
      await screenshotsApi.deleteScreenshot(screenshotId);
      return screenshotId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete screenshot');
    }
  }
);

const screenshotSlice = createSlice({
  name: 'screenshots',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearScreenshots: (state) => {
      state.screenshots = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Upload Screenshots
    builder
      .addCase(uploadScreenshots.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadScreenshots.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        // Add new screenshots to the beginning of the array
        state.screenshots = [...action.payload, ...state.screenshots];
        state.error = null;
      })
      .addCase(uploadScreenshots.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });

    // Fetch Screenshots
    builder
      .addCase(fetchTradeScreenshots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradeScreenshots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.screenshots = action.payload;
        state.error = null;
      })
      .addCase(fetchTradeScreenshots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Screenshot
    builder
      .addCase(deleteScreenshot.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteScreenshot.fulfilled, (state, action) => {
        // Remove deleted screenshot from array
        state.screenshots = state.screenshots.filter(
          (screenshot) => screenshot.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteScreenshot.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setUploadProgress, clearScreenshots, clearError } = screenshotSlice.actions;

// Selectors
export const selectScreenshots = (state: RootState) => state.screenshots.screenshots;
export const selectIsLoading = (state: RootState) => state.screenshots.isLoading;
export const selectIsUploading = (state: RootState) => state.screenshots.isUploading;
export const selectUploadProgress = (state: RootState) => state.screenshots.uploadProgress;
export const selectError = (state: RootState) => state.screenshots.error;

// Reducer
export default screenshotSlice.reducer;
